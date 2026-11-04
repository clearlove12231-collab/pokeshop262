/**
 * Local mirror of a source asset: a path under wp-content on the source
 * (e.g. themes/…/logo.webp) is served from public/sites/samuraiswordtokyo/
 * with the same relative path. See scripts/samuraiswordtokyo/download-assets.mjs.
 * Nothing on the page links to or loads from the source site.
 */
export const src = (path: string) => `/sites/samuraiswordtokyo${path}`;
