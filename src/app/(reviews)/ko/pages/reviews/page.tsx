import type { Metadata } from "next";
import { parseQuery } from "@/components/sites/samuraiswordtokyo/reviews/query";
import { ReviewsPage } from "@/components/sites/samuraiswordtokyo/reviews/ReviewsPage";

export const metadata: Metadata = {
  title: "고객 리뷰 - Samurai Sword Tokyo",
  description: "Samurai Sword Tokyo에서 구매한 고객이 작성한 리뷰.",
};

/** Clone of https://samuraiswordtokyo.com/ko/pages/reviews (?rv_group, rv_photos, rv_stars, rv_sort, rv_page). */
export default async function ReviewsRoute({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <ReviewsPage query={parseQuery(await searchParams)} />;
}
