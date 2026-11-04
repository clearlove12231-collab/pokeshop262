import type { Metadata } from "next";
import { SamuraiSwordHome } from "@/components/sites/samuraiswordtokyo/SamuraiSwordHome";

export const metadata: Metadata = {
  title: "Pokeshop - 포켓몬 카드 샵",
  description: "포켓몬 카드 샵 Pokeshop. 상품 주문 문의는 TikTok DM(@pokeshopkr)으로 받습니다.",
};

/** Shop homepage (Pokemon catalog). */
export default function KoreanHomePage() {
  return <SamuraiSwordHome />;
}
