import type { Metadata } from "next";
import { parseQuery } from "@/components/sites/samuraiswordtokyo/reviews/query";
import { ReviewsPage } from "@/components/sites/samuraiswordtokyo/reviews/ReviewsPage";

export const metadata: Metadata = {
  title: "원피스 카드 리뷰 - Samurai Sword Tokyo",
  description: "원피스 카드 리뷰 안내 페이지입니다. Samurai Sword Tokyo는 도쿄에서 정품 일본 TCG 상품을 전 세계로 발송합니다.",
};

/** Clone of https://samuraiswordtokyo.com/ko/pages/reviews-one-piece (?rv_photos, rv_stars, rv_sort, rv_page). */
export default async function OnePieceReviewsRoute({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <ReviewsPage category="one-piece" query={parseQuery(await searchParams)} />;
}
