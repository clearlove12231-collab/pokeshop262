import type { Metadata } from "next";
import Script from "next/script";
import { SiteDocument, THEME_SCRIPT } from "@/components/sites/samuraiswordtokyo/SiteDocument";
import "../globals.css";

export const metadata: Metadata = {
  title: "Pokeshop - 포켓몬 카드 샵",
  description: "포켓몬 카드 샵 Pokeshop",
  icons: { icon: "/shop/logo.webp" },
};

/** Root layout (body classes the base site styles key on). */
export default function HomeLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <SiteDocument
      htmlClassName="sst-hb-usdeal sst-hb-rows"
      htmlData={{ "data-sst-qo-b2b-js": "1" }}
      bodyClassName="home page-template-default page theme-samurai-sword sst-lang-ko woocommerce-js"
    >
      {children}
      <Script id="sst-theme" strategy="beforeInteractive">
        {THEME_SCRIPT}
      </Script>
    </SiteDocument>
  );
}
