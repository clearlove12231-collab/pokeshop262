/** Live store the clone was made from. */
const SOURCE_ORIGIN = "https://samuraiswordtokyo.com";

/**
 * Links to pages outside the clone (product pages, account, news, other
 * locales, other game tabs) are blocked: they render as "#" and LinkGuard
 * cancels the click, so visitors stay on the clone.
 * Set to true to make them open the live store again.
 */
export const LINK_TO_SOURCE = false;

/** href for a page on the live store (path like "/ko/faq" or a full URL). */
export function sourceHref(pathOrUrl: string): string {
  if (!LINK_TO_SOURCE) return "#";
  return pathOrUrl.startsWith("http") ? pathOrUrl : `${SOURCE_ORIGIN}${pathOrUrl}`;
}

/** True for URLs on the live store's domain. */
export function isSourceUrl(url: URL): boolean {
  return url.hostname === "samuraiswordtokyo.com" || url.hostname.endsWith(".samuraiswordtokyo.com");
}

/**
 * Local mirror of a source asset: a path under wp-content on the source
 * (e.g. themes/…/logo.webp) is served from public/sites/samuraiswordtokyo/
 * with the same relative path. See scripts/samuraiswordtokyo/download-assets.mjs.
 */
export const src = (path: string) => `/sites/samuraiswordtokyo${path}`;
