import data from "../data/reviews.json";
import { BASE_PATH, type ReviewSort } from "./constants";

export type ReviewGroup = "pokemon" | "onepiece" | "psa10" | "other";

export interface Review {
  id: string;
  product: { name: string; url: string; img: string };
  also?: { name: string; url: string }[];
  rating: number;
  author: string;
  verified: boolean;
  datetime: string;
  date: string;
  text: string[];
  media?: { thumb: string; full: string }[];
  reply?: string;
  group: ReviewGroup;
}

export interface ReviewedProduct {
  name: string;
  url: string;
  img: string;
  avg?: string;
  count: string;
}

export const REVIEWS = (data as { reviews: Review[] }).reviews;
export const TOP_PRODUCTS = (data as { products: ReviewedProduct[] }).products;

/** Counts shown by the source (they cover more ratings than the 934 reviews it lists). */
export const SOURCE_TOTAL = 1502;
export const SOURCE_STAR_COUNTS: Record<number, number> = { 5: 1407, 4: 48, 3: 25, 2: 8, 1: 14 };
export const SOURCE_GROUP_CHIPS: { group: ReviewGroup | "photos"; label: string; count: number }[] = [
  { group: "pokemon", label: "포켓몬", count: 833 },
  { group: "onepiece", label: "원피스", count: 189 },
  { group: "psa10", label: "PSA 10", count: 138 },
  { group: "other", label: "기타 상품", count: 342 },
  { group: "photos", label: "사진 있음", count: 469 },
];

export const PER_PAGE = 24;
export { BASE_PATH, type ReviewSort };

export interface ReviewQuery {
  group?: ReviewGroup;
  photos?: boolean;
  stars?: number;
  sort: ReviewSort;
  page: number;
}

const GROUPS: ReviewGroup[] = ["pokemon", "onepiece", "psa10", "other"];
const SORTS: ReviewSort[] = ["newest", "photos", "high", "low"];

/** Reads the source's query parameters (rv_group, rv_photos, rv_stars, rv_sort, rv_page). */
export function parseQuery(params: Record<string, string | string[] | undefined>): ReviewQuery {
  const one = (k: string) => (Array.isArray(params[k]) ? params[k]?.[0] : params[k]) as string | undefined;
  const group = one("rv_group") as ReviewGroup | undefined;
  const stars = Number(one("rv_stars"));
  const sort = one("rv_sort") as ReviewSort | undefined;
  return {
    group: group && GROUPS.includes(group) ? group : undefined,
    photos: one("rv_photos") === "1" || undefined,
    stars: stars >= 1 && stars <= 5 ? stars : undefined,
    sort: sort && SORTS.includes(sort) ? sort : "newest",
    page: Math.max(1, Math.floor(Number(one("rv_page")) || 1)),
  };
}

/** Local URL for a query, keeping only the parameters that are set. */
export function reviewsHref(q: Partial<ReviewQuery>): string {
  const p = new URLSearchParams();
  if (q.group) p.set("rv_group", q.group);
  if (q.photos) p.set("rv_photos", "1");
  if (q.stars) p.set("rv_stars", String(q.stars));
  if (q.sort && q.sort !== "newest") p.set("rv_sort", q.sort);
  if (q.page && q.page > 1) p.set("rv_page", String(q.page));
  const s = p.toString();
  return s ? `${BASE_PATH}?${s}` : BASE_PATH;
}

export function isFiltered(q: ReviewQuery): boolean {
  return Boolean(q.group || q.photos || q.stars);
}

/** Filtered + sorted reviews (the data is stored newest first). */
export function selectReviews(q: ReviewQuery): Review[] {
  let list = REVIEWS.filter(
    (r) => (!q.group || r.group === q.group) && (!q.photos || r.media) && (!q.stars || r.rating === q.stars),
  );
  if (q.sort === "photos") list = [...list].sort((a, b) => Number(!!b.media) - Number(!!a.media));
  if (q.sort === "high") list = [...list].sort((a, b) => b.rating - a.rating);
  if (q.sort === "low") list = [...list].sort((a, b) => a.rating - b.rating);
  return list;
}

/** WordPress paginate_links() layout: end_size 1, mid_size 2 (1 2 3 … 39). */
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
