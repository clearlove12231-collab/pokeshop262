import type { ReactNode } from "react";

/**
 * Applies the saved theme before hydration, like the source's inline head script.
 * Root layouts render it with <Script strategy="beforeInteractive"> (Next.js requires
 * that element to live in the root layout file itself).
 */
export const THEME_SCRIPT = `try{if(localStorage.getItem('sst-theme')==='dark'){document.documentElement.setAttribute('data-sst-theme','dark')}}catch(e){}`;

/**
 * <html>/<body> shell for a cloned page. Each source page has its own body
 * classes (the site CSS keys on them), so every route group's root layout
 * passes its own. Fonts are self-hosted @font-face rules in the site stylesheet.
 */
export function SiteDocument({
  htmlClassName,
  htmlData,
  bodyClassName,
  children,
}: {
  htmlClassName?: string;
  htmlData?: Record<`data-${string}`, string>;
  bodyClassName: string;
  children: ReactNode;
}) {
  return (
    <html lang="ko" dir="ltr" className={htmlClassName} {...htmlData} suppressHydrationWarning>
      <body className={bodyClassName}>{children}</body>
    </html>
  );
}
