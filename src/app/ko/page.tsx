import type { Metadata } from "next";
import { SamuraiSwordHome } from "@/components/sites/samuraiswordtokyo/SamuraiSwordHome";

export const metadata: Metadata = {
  title: "일본 포켓몬 카드/TCG 스토어 - Samurai Sword Tokyo",
  description: "도쿄에서 발송되는 미개봉 일본 포켓몬 카드와 TCG 상품.",
};

/** Clone of https://samuraiswordtokyo.com/ko/?qo_tab=pokemon */
export default function KoreanHomePage() {
  return <SamuraiSwordHome />;
}
