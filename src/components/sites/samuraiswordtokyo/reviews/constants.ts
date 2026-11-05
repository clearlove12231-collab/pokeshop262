// Kept separate from query.ts so client components don't bundle the review data.
import type { Family } from "../families";

export type ReviewSort = "newest" | "photos" | "high" | "low";

/** Review categories cloned from the source (/ko/pages/reviews-<category>). */
export type ReviewCategory = "pokemon" | "one-piece";

export interface ReviewCategoryInfo {
  /** Local path, same as the source's. */
  path: string;
  /** Hidden rv_group value of the source's sort form. */
  group: string;
  /** Category chip label. */
  chip: string;
  /** Page heading and breadcrumb. */
  title: string;
  /** Home tab whose products these reviews are about (breadcrumb "홈"). */
  family: Family;
}

export const REVIEW_CATEGORIES: Record<ReviewCategory, ReviewCategoryInfo> = {
  pokemon: { path: "/ko/pages/reviews-pokemon", group: "pokemon", chip: "포켓몬", title: "포켓몬 카드 리뷰", family: "pokemon" },
  "one-piece": { path: "/ko/pages/reviews-one-piece", group: "onepiece", chip: "원피스", title: "원피스 카드 리뷰", family: "onepiece" },
};

/** Category chips in source order (the source's 전체, PSA 10 and 기타 상품 chips are not cloned). */
export const CATEGORY_ORDER: ReviewCategory[] = ["pokemon", "one-piece"];

export const CATEGORY_OF_FAMILY: Record<Family, ReviewCategory> = { pokemon: "pokemon", onepiece: "one-piece" };
