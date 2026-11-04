#!/usr/bin/env node
/**
 * Rebuilds a page stylesheet from the live store: every <link rel=stylesheet>
 * and <style> of the page HTML, in document order, concatenated into one file.
 * url(...) references are resolved and pointed at the local mirror
 * (/sites/samuraiswordtokyo/...), so download-assets.mjs can fetch them.
 * Google Fonts are reduced to their latin + latin-ext subsets.
 *
 * Prune the result afterwards with prune-css.mjs.
 *
 * Usage: node --use-system-ca scripts/samuraiswordtokyo/build-page-css.mjs <page-url> <out.css>
 * e.g.   ... build-page-css.mjs https://samuraiswordtokyo.com/ko/pages/reviews-pokemon \
 *            src/components/sites/samuraiswordtokyo/reviews/reviews.css
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const { parse } = createRequire(import.meta.url)("next/dist/compiled/node-html-parser");

const [pageUrl, outArg] = process.argv.slice(2);
if (!pageUrl || !outArg) {
  console.error("usage: build-page-css.mjs <page-url> <out.css>");
  process.exit(1);
}
const outFile = path.resolve(outArg);
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";

async function get(url) {
  for (let i = 1; ; i++) {
    try {
      const res = await fetch(url, { headers: { "user-agent": UA, "accept-language": "ko" } });
      if (!res.ok) throw new Error(`${res.status} ${url}`);
      return await res.text();
    } catch (e) {
      if (i >= 3) throw e;
      await new Promise((r) => setTimeout(r, 1000 * i));
    }
  }
}

const external = new Set();

/** Absolute source URL -> local mirror path (same mapping as download-assets.mjs). */
function localUrl(abs) {
  const u = new URL(abs);
  if (u.hostname === "samuraiswordtokyo.com") {
    if (u.pathname.startsWith("/wp-content/")) return `/sites/samuraiswordtokyo${u.pathname.replace(/^\/wp-content/, "")}`;
    if (u.pathname.startsWith("/wp-includes/")) return `/sites/samuraiswordtokyo${u.pathname}`;
  }
  if (u.hostname === "fonts.gstatic.com") return `/sites/samuraiswordtokyo/ext/fonts.gstatic.com${u.pathname}`;
  external.add(abs);
  return abs;
}

function rewriteUrls(css, base) {
  return css.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g, (m, q, ref) => {
    if (/^(data:|#)/i.test(ref)) return m;
    return `url("${localUrl(new URL(ref, base).href)}")`;
  });
}

/** Google Fonts CSS: keep the latin and latin-ext @font-face blocks only. */
function latinOnly(css) {
  return css
    .split(/(?=\/\* [\w-]+ \*\/)/)
    .filter((block) => /^\/\* (latin|latin-ext) \*\//.test(block.trim()))
    .join("");
}

async function main() {
  const html = await get(pageUrl);
  const doc = parse(html);
  const parts = [];
  for (const el of doc.querySelectorAll('link[rel~="stylesheet"], style')) {
    if (el.tagName === "LINK") {
      const href = new URL(el.getAttribute("href"), pageUrl).href;
      let css = await get(href);
      if (/fonts\.googleapis\.com/.test(href)) css = latinOnly(css);
      css = rewriteUrls(css, href);
      // media="print" + onload="this.media='all'" is the async-loading trick: it applies to screens.
      const asyncLoaded = /this\.media\s*=/.test(el.getAttribute("onload") ?? "");
      const media = asyncLoaded ? "all" : el.getAttribute("media");
      if (media && media !== "all") css = `@media ${media} {\n${css}\n}`;
      parts.push(`/* ${href.replace(/\?.*$/, "")} */\n${css}`);
    } else {
      const css = rewriteUrls(el.innerHTML, pageUrl);
      if (css.trim()) parts.push(`/* <style${el.id ? ` id="${el.id}"` : ""}> */\n${css}`);
    }
  }
  const out = parts.join("\n\n") + "\n";
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, out);
  console.log(`${parts.length} stylesheets, ${(out.length / 1024).toFixed(0)} KB -> ${outFile}`);
  if (external.size) console.log("left external:", [...external]);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
