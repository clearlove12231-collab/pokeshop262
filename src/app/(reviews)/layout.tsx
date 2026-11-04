import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Samurai Sword Tokyo (clone)",
  description: "Local clone of the Samurai Sword Tokyo Pokemon reviews page",
};

/**
 * Root layout for the reviews page. The source reviews page has its own body
 * classes (sst-rvp-page …), which its stylesheet keys on, so it gets a separate
 * root layout from the home page (switching between them is a full page load).
 */
export default function ReviewsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" dir="ltr">
      <body className="wp-singular page-template-default page wp-theme-samurai-sword theme-samurai-sword sst-rvp-page sst-lang-ko woocommerce-js">
        {children}
      </body>
    </html>
  );
}
