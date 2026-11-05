#!/usr/bin/env node
/**
 * Builds one review category for the clone from the live store's
 * https://samuraiswordtokyo.com/ko/pages/reviews-<category> (?rv_page=1..N, 24 per page).
 *
 * - Only the Pokemon and One Piece categories are cloned; reviews of individual
 *   PSA cards are dropped (same rule as the shop: product name mentions "PSA <grade>").
 * - No source URLs are kept: products are stored by name and image only.
 * - Images point at the local mirror (/sites/samuraiswordtokyo/...); run
 *   download-assets.mjs afterwards to fetch them.
 *
 * Output: src/components/sites/samuraiswordtokyo/data/reviews.json (pokemon)
 *         src/components/sites/samuraiswordtokyo/data/reviews-one-piece.json (one-piece)
 * Usage:  node --use-system-ca scripts/samuraiswordtokyo/extract-reviews.mjs [pokemon|one-piece]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

// Next.js ships node-html-parser precompiled; reuse it instead of adding a dependency.
const { parse } = createRequire(import.meta.url)("next/dist/compiled/node-html-parser");

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

/** Source review pages (/ko/pages/reviews-<category>) and their output files. */
const CATEGORIES = { pokemon: "reviews.json", "one-piece": "reviews-one-piece.json" };
const category = process.argv[2] ?? "pokemon";
if (!CATEGORIES[category]) {
  console.error(`usage: extract-reviews.mjs [${Object.keys(CATEGORIES).join("|")}]`);
  process.exit(1);
}
const outFile = path.join(root, "src/components/sites/samuraiswordtokyo/data", CATEGORIES[category]);

const ORIGIN = "https://samuraiswordtokyo.com";
const PAGE_URL = `${ORIGIN}/ko/pages/reviews-${category}`;
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";
const isPsaSingle = (name) => /\bPSA\s?\d/i.test(name);

async function getHtml(url, tries = 3) {
  for (let i = 1; ; i++) {
    try {
      const res = await fetch(url, { headers: { "user-agent": UA, "accept-language": "ko" } });
      if (!res.ok) throw new Error(`${res.status} ${url}`);
      return await res.text();
    } catch (e) {
      if (i >= tries) throw e;
      await new Promise((r) => setTimeout(r, 1000 * i));
    }
  }
}

const clean = (s) => s.replace(/ /g, " ").replace(/[ \t]+/g, " ").trim();
const text = (el) => clean(el?.text ?? "");

/** https://samuraiswordtokyo.com/wp-content/<p> -> /sites/samuraiswordtokyo/<p> */
function localAsset(url) {
  const u = new URL(url, ORIGIN);
  return `/sites/samuraiswordtokyo${u.pathname.replace(/^\/wp-content/, "")}`;
}

/** Paragraph text with <br> kept as "\n". */
function paragraph(p) {
  return parse(p.innerHTML.replace(/<br\s*\/?>/gi, "\n"))
    .text.split("\n")
    .map(clean)
    .join("\n")
    .trim();
}

const videos = [];

function parseReview(li) {
  const id = li.getAttribute("id")?.replace("li-comment-", "") ?? "";
  const prod = li.querySelector(".sst-rvp-product");
  const productImg = prod?.querySelector("img")?.getAttribute("src");
  const media = [];
  for (const btn of li.querySelectorAll(".sst-review-media__thumb")) {
    const full = btn.getAttribute("data-full") ?? "";
    const thumb = btn.querySelector("img")?.getAttribute("src") ?? "";
    if (/\.(mp4|mov|webm)(\?|$)/i.test(full) || btn.getAttribute("data-type") === "video" || btn.querySelector("video")) {
      videos.push({ id, full });
      continue;
    }
    if (full && thumb) media.push({ thumb: localAsset(thumb), full: localAsset(full) });
  }
  const ratingEl = li.querySelector(".star-rating .rating");
  const time = li.querySelector("time");
  const review = {
    id,
    product: { name: text(prod?.querySelector(".sst-rvp-product__name")), img: productImg ? localAsset(productImg) : "" },
    also: li.querySelectorAll(".sst-rvp-also a").map(text).filter(Boolean),
    rating: Number(text(ratingEl)) || 0,
    author: text(li.querySelector(".woocommerce-review__author")),
    verified: Boolean(li.querySelector(".woocommerce-review__verified")),
    datetime: time?.getAttribute("datetime") ?? "",
    date: text(time),
    text: li.querySelectorAll(".description > p").map(paragraph).filter(Boolean),
    media,
  };
  if (!review.also.length) delete review.also;
  if (!review.media.length) delete review.media;
  return review;
}

async function main() {
  const first = await getHtml(PAGE_URL);
  const firstDoc = parse(first);
  const lastPage = Math.max(
    1,
    ...firstDoc
      .querySelectorAll(".sst-rvp-pager a.page-numbers")
      .map((a) => Number(new URL(a.getAttribute("href"), ORIGIN).searchParams.get("rv_page")) || 0),
  );
  console.log(`pages: ${lastPage}`);
  console.log("source summary:", text(firstDoc.querySelector(".sst-rvp-summary")));

  const all = [];
  for (let page = 1; page <= lastPage; page++) {
    const html = page === 1 ? first : await getHtml(`${PAGE_URL}?rv_page=${page}`);
    const items = parse(html).querySelectorAll(".commentlist > li.review").map(parseReview);
    all.push(...items);
    process.stdout.write(`page ${page}: ${items.length}\n`);
  }

  // Each review appears once; pages can shift if a review is published mid-run.
  const seen = new Set();
  const unique = all.filter((r) => (seen.has(r.id) ? false : (seen.add(r.id), true)));
  const reviews = unique.filter((r) => !isPsaSingle(r.product.name));
  for (const r of reviews) if (r.also) r.also = r.also.filter((n) => !isPsaSingle(n));

  console.log(
    `reviews: ${all.length} listed, ${unique.length} unique, ${reviews.length} kept ` +
      `(${unique.length - reviews.length} PSA singles dropped), ${reviews.filter((r) => r.media).length} with photos, ` +
      `${reviews.reduce((n, r) => n + (r.media?.length ?? 0), 0)} photos, unverified: ${reviews.filter((r) => !r.verified).length}`,
  );
  if (videos.length) console.log(`videos skipped (not mirrored): ${videos.length}`, videos);

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify({ source: PAGE_URL, capturedAt: new Date().toISOString(), reviews }, null, 1) + "\n");
  console.log(`wrote ${path.relative(root, outFile)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
