import type { Metadata } from "next";
import { parseQuery } from "@/components/sites/samuraiswordtokyo/reviews/query";
import { ReviewsPage } from "@/components/sites/samuraiswordtokyo/reviews/ReviewsPage";

export const metadata: Metadata = {
  title: "포켓몬 카드 리뷰 - Samurai Sword Tokyo",
  description: "포켓몬 카드 상품을 구매한 고객이 작성한 리뷰.",
};

/** Clone of https://samuraiswordtokyo.com/ko/pages/reviews-pokemon (?rv_photos, rv_stars, rv_sort, rv_page). */
export default async function PokemonReviewsRoute({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <ReviewsPage query={parseQuery(await searchParams)} />;
}
