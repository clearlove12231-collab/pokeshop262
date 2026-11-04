#!/usr/bin/env node
/**
 * Builds the Pokemon quick-order catalog for the clone from the live store:
 *   - page HTML of https://samuraiswordtokyo.com/ko/?qo_tab=pokemon
 *     (preorder/HOT rows, group labels, review stars data, group cache keys)
 *   - the store's group endpoint (?samurai_qo_group=1&action=samurai_qo_group),
 *     which returns 24 rendered rows per request, for every other Pokemon group
 *
 * Individual PSA graded cards are not sold on the clone: the PSA10 group is
 * skipped and any remaining row whose name mentions PSA is dropped.
 * Prices stay in JPY here; the page converts them (see price.ts).
 *
 * Output: src/components/sites/samuraiswordtokyo/data/quick-order.json
 * Usage:  node scripts/samuraiswordtokyo/extract-catalog.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

// Next.js ships node-html-parser precompiled; reuse it instead of adding a dependency.
const { parse } = createRequire(import.meta.url)("next/dist/compiled/node-html-parser");

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const outFile = path.join(root, "src/components/sites/samuraiswordtokyo/data/quick-order.json");

const ORIGIN = "https://samuraiswordtokyo.com";
const PAGE_URL = `${ORIGIN}/ko/?qo_tab=pokemon`;
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";
const PAGE_SIZE = 24;

/** Pokemon groups in source order; PSA10 (individual graded cards) is left out. */
const GROUP_ORDER = ["pokemon-preorder", "pokemon-box", "pokemon-bulk", "pokemon-other", "pokemon-vintage"];
const isPsaSingle = (name) => /\bPSA\s?\d/i.test(name);

/** Group classes the source adds at runtime or for features this clone leaves out. */
const DROP_GROUP_CLASSES = new Set(["sst-qo__group", "sst-psa-price-on", "sst-psa-stock-on", "sst-box-tb", "sst-qo-in-all", "sst-qo__group--hidden"]);

async function get(url) {
  const res = await fetch(url, { headers: { "user-agent": UA, "accept-language": "ko" } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res;
}

const decode = (s) =>
  (s ?? "")
    .replace(/&#0?38;|&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
const text = (el) => decode(el?.text ?? "").replace(/\s+/g, " ").trim();
const attr = (el, name) => decode(el?.getAttribute(name) ?? "");
const num = (v) => Number(String(v ?? "").replace(/[^\d.]/g, "")) || 0;

/** https://samuraiswordtokyo.com/wp-content/<p> -> /sites/samuraiswordtokyo/<p> */
function localAsset(url) {
  const u = new URL(url, ORIGIN);
  const p = u.pathname.replace(/^\/wp-content/, "");
  return `/sites/samuraiswordtokyo${p}`;
}

/** Keeps the 160w and 320w candidates (what the card sizes actually pick). */
function localSrcSet(srcset) {
  return srcset
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.split(/\s+/))
    .filter(([, w]) => w === "160w" || w === "320w")
    .map(([u, w]) => `${localAsset(u)} ${w}`)
    .join(", ");
}

/**
 * The store renders the first group (Preorder/HOT) with Korean offer labels but
 * returns English ones from the group endpoint; the clone uses the Korean
 * labels everywhere.
 */
const LABELS_KO = { Item: "상품", Sealed: "밀봉", "No Shrink": "슈링크 없음" };
const localLabel = (label) => LABELS_KO[label] ?? label;

/** What the offer's action area shows on the source. */
function actionKind(td) {
  const box = td.querySelector(".sst-qo__offer-action");
  if (box?.querySelector(".sst-qo__qty")) return "qty";
  if (box?.querySelector(".sst-qo__not-sold")) return "not-sold";
  if (box?.querySelector(".sst-rsn-btn")) return "notify";
  return "empty";
}

function parseOffer(td) {
  const input = td.querySelector("input[data-variant-id]");
  const sale = attr(td, "data-qo-sale") === "1";
  const offer = {
    type: attr(td, "data-qo-offer-type"),
    classes: (attr(td, "class") || "").split(/\s+/).filter((c) => c.startsWith("sst-qo__offer--")),
    label: localLabel(text(td.querySelector(".sst-qo__offer-label"))),
    stockText: text(td.querySelector(".sst-qo__offer-stock")),
    stockState: attr(td, "data-qo-stock-state") || attr(td, "data-stock-state"),
    action: attr(td, "data-qo-action-state"),
    actionKind: actionKind(td),
    priceState: attr(td, "data-qo-price-state"),
    priceYen: num(attr(td, "data-qo-price-yen")),
    max: num(attr(td, "data-qo-max-qty")),
    productId: num(attr(td, "data-qo-product-id")),
    variantId: num(attr(td, "data-qo-variation-id")) || num(attr(td, "data-qo-line-product-id")) || num(attr(td, "data-qo-product-id")),
  };
  const colspan = num(attr(td, "colspan"));
  if (colspan > 1) offer.colSpan = colspan;
  if (sale) {
    offer.saleRegularYen = num(attr(td, "data-qo-sale-regular-price-yen"));
    offer.salePriceYen = num(attr(td, "data-qo-sale-price-yen")) || offer.priceYen;
  }
  if (input) {
    offer.sku = attr(input, "data-sku") || undefined;
    offer.cartName = attr(input, "data-name") || undefined;
  }
  return offer;
}

function parseRow(tr, ratings) {
  const img = tr.querySelector("img.sst-qo__img");
  const handle = attr(tr, "data-handle");
  const name = text(tr.querySelector(".sst-qo__pname"));
  const offers = tr.querySelectorAll("td.sst-qo__offer").map(parseOffer);
  const rowClass = (attr(tr, "class") || "").trim();
  const imgSrc = attr(img, "data-src") || attr(img, "src");
  const product = {
    key: attr(tr, "data-qo-row-key") || handle,
    handle,
    rowClass: rowClass || undefined,
    group: attr(tr, "data-qo-group") || attr(tr, "data-group"),
    subgroup: attr(tr, "data-qo-subgroup"),
    name,
    search: attr(tr, "data-search"),
    jan: attr(tr, "data-jan") || undefined,
    img: {
      src: localAsset(imgSrc),
      srcSet: localSrcSet(attr(img, "data-srcset") || attr(img, "srcset")),
      sizes: attr(img, "data-sizes") || attr(img, "sizes") || undefined,
      width: num(attr(img, "width")),
      height: num(attr(img, "height")),
      variant: attr(tr, "data-qo-media-variant") || "default",
      alt: attr(img, "alt") || name,
    },
    priceYen: num(attr(tr, "data-qo-price-yen")),
    stockTotal: num(attr(tr, "data-qo-stock-total")),
    hot: attr(tr, "data-qo-hot") === "1",
    sale: attr(tr, "data-qo-sale") === "1",
    flash: rowClass.includes("sst-qo__row--flash"),
    preorder: attr(tr, "data-qo-preorder") === "1",
    releaseText: attr(tr, "data-qo-release-text") || undefined,
    offers,
  };
  const pid = offers.find((o) => o.productId)?.productId;
  const r = pid ? ratings[pid] : null;
  if (r && Number(r[1]) > 0 && Number(r[0]) > 0) product.rating = { avg: Number(r[0]), count: Number(r[1]) };
  return product;
}

function rowsOf(html) {
  return parse(`<table><tbody>${html}</tbody></table>`).querySelectorAll("tbody > tr[data-handle]");
}

async function main() {
  const pageHtml = await (await get(PAGE_URL)).text();
  const doc = parse(pageHtml);

  const cfgMatch = pageHtml.match(/var samuraiSwordQuickOrder = (\{.*?\});\s*\n/s);
  if (!cfgMatch) throw new Error("samuraiSwordQuickOrder config not found");
  const cfg = JSON.parse(cfgMatch[1]);
  const ratings = JSON.parse(doc.querySelector("#sst-rs-qo-data")?.text || "{}");

  const groups = [];
  for (const id of GROUP_ORDER) {
    const el = doc.querySelector(`.sst-qo__group[data-group="${id}"]`);
    if (!el) throw new Error(`group ${id} not on the page`);
    const meta = {
      id,
      subgroup: attr(el, "data-qo-subgroup"),
      label: text(el.querySelector(".sst-qo__label")),
      classes: (attr(el, "class") || "").split(/\s+/).filter((c) => c && !DROP_GROUP_CLASSES.has(c)).join(" ") || undefined,
    };
    let rows = rowsOf(el.querySelector("tbody")?.innerHTML ?? "").map((tr) => parseRow(tr, ratings));
    let total = rows.length;
    if (id !== "pokemon-preorder") {
      rows = [];
      for (let offset = 0; ; offset += PAGE_SIZE) {
        const q = new URLSearchParams({
          samurai_qo_group: "1",
          action: cfg.groupLoadAction,
          group: id,
          offset: String(offset),
          limit: String(PAGE_SIZE),
          q: "",
          sort: "default",
          stock_only: "0",
          price: "all",
          group_version: String(cfg.groupCacheVersions?.[id] ?? ""),
          ctx: cfg.groupCacheContext ?? "",
        });
        const json = await (await get(`${ORIGIN}/ko?${q}`)).json();
        if (!json.success) throw new Error(`group ${id} offset ${offset} failed`);
        rows.push(...rowsOf(json.data.html).map((tr) => parseRow(tr, ratings)));
        total = json.data.total;
        if (!json.data.hasMore) break;
      }
    }
    const kept = rows.filter((p) => !isPsaSingle(p.name));
    const dropped = rows.length - kept.length;
    groups.push({ ...meta, total: total - dropped, rows: kept });
    console.log(`${id}: ${kept.length} rows (source total ${total}, dropped ${dropped} PSA)`);
  }

  // In the "전체" view the source hides rows that already appear in Preorder/HOT.
  const featured = new Set(groups[0].rows.map((p) => p.handle));
  for (const g of groups.slice(1)) for (const p of g.rows) if (featured.has(p.handle)) p.dupOfFeatured = true;

  // Drop helper-only offer fields from the output.
  for (const g of groups) for (const p of g.rows) for (const o of p.offers) delete o.productId;

  const stats = { actions: {}, kinds: {}, priceStates: {}, types: {}, stock: {}, labels: {} };
  for (const g of groups)
    for (const p of g.rows)
      for (const o of p.offers) {
        const kind = `${o.action}/${o.stockState}/${o.priceState} -> ${o.actionKind}`;
        stats.kinds[kind] = (stats.kinds[kind] ?? 0) + 1;
        stats.labels[o.label] = (stats.labels[o.label] ?? 0) + 1;
        stats.actions[o.action] = (stats.actions[o.action] ?? 0) + 1;
        stats.priceStates[o.priceState] = (stats.priceStates[o.priceState] ?? 0) + 1;
        stats.types[o.type] = (stats.types[o.type] ?? 0) + 1;
        stats.stock[o.stockState] = (stats.stock[o.stockState] ?? 0) + 1;
      }
  console.log(stats);

  const reviewBar = doc.querySelector(".sst-hrb");
  console.log("review bar:", text(reviewBar));

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(
    outFile,
    JSON.stringify({ source: PAGE_URL, capturedAt: new Date().toISOString(), groups }, null, 1) + "\n",
  );
  console.log(`wrote ${path.relative(root, outFile)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
