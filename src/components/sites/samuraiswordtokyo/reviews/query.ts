import pokemonData from "../data/reviews.json";
import onePieceData from "../data/reviews-one-piece.json";
import { CATEGORY_ORDER, REVIEW_CATEGORIES, type ReviewCategory, type ReviewSort } from "./constants";

/** One review of data/reviews*.json (built by scripts/samuraiswordtokyo/extract-reviews.mjs). */
export interface Review {
  id: string;
  product: { name: string; img: string };
  also?: string[];
  rating: number;
  author: string;
  verified: boolean;
  datetime: string;
  date: string;
  /** Paragraphs; "\n" marks a line break inside a paragraph. */
  text: string[];
  media?: { thumb: string; full: string }[];
}

/** Reviews per cloned category (PSA singles and other games are not part of the clone), newest first. */
export const REVIEWS: Record<ReviewCategory, Review[]> = {
  pokemon: (pokemonData as { reviews: Review[] }).reviews,
  "one-piece": (onePieceData as { reviews: Review[] }).reviews,
};

export const PER_PAGE = 24;
export { REVIEW_CATEGORIES, type ReviewCategory, type ReviewSort };

export interface ReviewStats {
  total: number;
  stars: Record<number, number>;
  avg: number;
  /** Shown with one decimal, like the source (4.875 → "4.9"). */
  avgText: string;
  photos: number;
  products: number;
  /** Share of 5-star reviews, rounded down like the source's "93%가 별 5개 평가". */
  fiveStarShare: number;
  /** Newest photo thumbnails, for the home review bar. */
  recentPhotos: string[];
}

/**
 * Headline numbers, counted from the reviews on each page. (The source's own
 * category numbers also include ratings it never lists, e.g. 834 vs 561.)
 */
function statsOf(reviews: Review[]): ReviewStats {
  const total = reviews.length;
  const stars: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  for (const r of reviews) stars[r.rating] = (stars[r.rating] ?? 0) + 1;
  const avg = total ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0;
  return {
    total,
    stars,
    avg,
    avgText: avg.toFixed(1),
    photos: reviews.filter((r) => r.media).length,
    products: new Set(reviews.map((r) => r.product.name)).size,
    fiveStarShare: total ? Math.floor((stars[5] / total) * 100) : 0,
    recentPhotos: reviews
      .filter((r) => r.media)
      .slice(0, 4)
      .map((r) => r.media![0].thumb),
  };
}

export const STATS = Object.fromEntries(CATEGORY_ORDER.map((c) => [c, statsOf(REVIEWS[c])])) as Record<ReviewCategory, ReviewStats>;

export interface ReviewedProduct {
  name: string;
  img: string;
  avg: number;
  count: number;
}

/** "리뷰가 많은 상품": the 12 products with the most reviews (ties: most recently reviewed first). */
function topProductsOf(reviews: Review[]): ReviewedProduct[] {
  const byName = new Map<string, ReviewedProduct & { sum: number; order: number }>();
  reviews.forEach((r, order) => {
    const p = byName.get(r.product.name) ?? { name: r.product.name, img: r.product.img, avg: 0, count: 0, sum: 0, order };
    p.count += 1;
    p.sum += r.rating;
    byName.set(r.product.name, p);
  });
  return [...byName.values()]
    .sort((a, b) => b.count - a.count || a.order - b.order)
    .slice(0, 12)
    .map(({ name, img, count, sum }) => ({ name, img, count, avg: sum / count }));
}

export const TOP_PRODUCTS = Object.fromEntries(CATEGORY_ORDER.map((c) => [c, topProductsOf(REVIEWS[c])])) as Record<
  ReviewCategory,
  ReviewedProduct[]
>;

export interface ReviewQuery {
  photos?: boolean;
  stars?: number;
  sort: ReviewSort;
  page: number;
}

const SORTS: ReviewSort[] = ["newest", "photos", "high", "low"];

/** Reads the source's query parameters (rv_photos, rv_stars, rv_sort, rv_page). */
export function parseQuery(params: Record<string, string | string[] | undefined>): ReviewQuery {
  const one = (k: string) => (Array.isArray(params[k]) ? params[k]?.[0] : params[k]) as string | undefined;
  const stars = Number(one("rv_stars"));
  const sort = one("rv_sort") as ReviewSort | undefined;
  return {
    photos: one("rv_photos") === "1" || undefined,
    stars: stars >= 1 && stars <= 5 ? stars : undefined,
    sort: sort && SORTS.includes(sort) ? sort : "newest",
    page: Math.max(1, Math.floor(Number(one("rv_page")) || 1)),
  };
}

/** Local URL of a category page for a query, keeping only the parameters that are set. */
export function reviewsHref(category: ReviewCategory, q: Partial<ReviewQuery>): string {
  const base = REVIEW_CATEGORIES[category].path;
  const p = new URLSearchParams();
  if (q.photos) p.set("rv_photos", "1");
  if (q.stars) p.set("rv_stars", String(q.stars));
  if (q.sort && q.sort !== "newest") p.set("rv_sort", q.sort);
  if (q.page && q.page > 1) p.set("rv_page", String(q.page));
  const s = p.toString();
  return s ? `${base}?${s}` : base;
}

/** Filtered + sorted reviews of a category (the data is stored newest first; sorts are stable). */
export function selectReviews(category: ReviewCategory, q: ReviewQuery): Review[] {
  let list = REVIEWS[category].filter((r) => (!q.photos || r.media) && (!q.stars || r.rating === q.stars));
  if (q.sort === "photos") list = [...list].sort((a, b) => Number(!!b.media) - Number(!!a.media));
  if (q.sort === "high") list = [...list].sort((a, b) => b.rating - a.rating);
  if (q.sort === "low") list = [...list].sort((a, b) => a.rating - b.rating);
  return list;
}

/** WordPress paginate_links() layout: end_size 1, mid_size 2 (1 2 3 … 24). */
export function pageItems(current: number, total: number): (number | "dots")[] {
  const items: (number | "dots")[] = [];
  let dots = false;
  for (let n = 1; n <= total; n++) {
    if (n === 1 || n === total || Math.abs(n - current) <= 2) {
      items.push(n);
      dots = true;
    } else if (dots) {
      items.push("dots");
      dots = false;
    }
  }
  return items;
}
