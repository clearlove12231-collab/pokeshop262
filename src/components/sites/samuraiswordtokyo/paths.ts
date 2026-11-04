/** Live store: out-of-scope links (product pages, account, other locales) point here. */
export const SOURCE = "https://samuraiswordtokyo.com";

/**
 * Local mirror of a source asset: a path under wp-content on the source
 * (e.g. themes/…/logo.webp) is served from public/sites/samuraiswordtokyo/
 * with the same relative path. See scripts/samuraiswordtokyo/download-assets.mjs.
 */
export const src = (path: string) => `/sites/samuraiswordtokyo${path}`;
