import type { Metadata } from "next";
import Script from "next/script";
import { SiteDocument, THEME_SCRIPT } from "@/components/sites/samuraiswordtokyo/SiteDocument";
import "../globals.css";

export const metadata: Metadata = {
  title: "Samurai Sword Tokyo (clone)",
  description: "Local clone of the Samurai Sword Tokyo reviews page",
};

/** Root layout for /ko/pages/reviews (source body classes of that page). */
export default function ReviewsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <SiteDocument bodyClassName="page-template-default page wp-theme-samurai-sword theme-samurai-sword sst-rvp-page sst-lang-ko woocommerce-js">
      {children}
      <Script id="sst-theme" strategy="beforeInteractive">
        {THEME_SCRIPT}
      </Script>
    </SiteDocument>
  );
}
