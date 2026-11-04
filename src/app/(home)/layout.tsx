import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Samurai Sword Tokyo (clone)",
  description: "Local clone of the Samurai Sword Tokyo Pokemon quick-order page",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Fonts are self-hosted @font-face rules in the site stylesheet, under the
    // same family names the source CSS uses (Figtree, SST Tab *).
    <html lang="ko" dir="ltr" className="sst-hb-usdeal sst-hb-rows" data-sst-qo-b2b-js="1">
      <body className="home page-template-default page theme-samurai-sword sst-lang-ko woocommerce-js">{children}</body>
    </html>
  );
}
