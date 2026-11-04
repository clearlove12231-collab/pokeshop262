import type { Metadata } from "next";
import Script from "next/script";
import { SiteDocument, THEME_SCRIPT } from "@/components/sites/samuraiswordtokyo/SiteDocument";
import "../globals.css";

export const metadata: Metadata = {
  title: "Samurai Sword Tokyo (clone)",
  description: "Local clone of the Samurai Sword Tokyo homepage",
};

/** Root layout for the homepage (source body classes of /ko/). */
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
