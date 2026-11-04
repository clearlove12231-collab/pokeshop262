#!/usr/bin/env node
/**
 * Prunes a page stylesheet of the clone to the rules that page's components
 * can match. Each page has its own stylesheet and scope:
 *   home    -> samuraiswordtokyo.css (header, review bar, quick order, cart)
 *   reviews -> reviews/reviews.css   (header, reviews page, cart)
 *
 * A selector is dropped when it requires a class or id that never appears in
 * the page's components/data (classes inside :not/:is/:where/:has are ignored,
 * so those selectors are kept), or when it targets the dark theme
 * (html[data-sst-theme="dark"]), which the clone no longer offers.
 * Afterwards unused @keyframes and @font-face rules and empty at-rules go too.
 *
 * Usage: node scripts/samuraiswordtokyo/prune-css.mjs <home|reviews> [--dry-run]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postcss from "postcss";
import selectorParser from "postcss-selector-parser";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const siteDir = path.join(root, "src/components/sites/samuraiswordtokyo");
const dryRun = process.argv.includes("--dry-run");

/** Files shared by both pages: header, cart and helpers. */
const SHARED = ["SiteChrome.tsx", "SiteHeader.tsx", "CartDrawer.tsx", "store.tsx", "stars.tsx", "price.ts", "paths.ts"];
const PAGES = {
  home: {
    css: "samuraiswordtokyo.css",
    sources: [...SHARED, "SamuraiSwordHome.tsx", "ReviewBar.tsx", "quick-order", "data/quick-order.json", "../../../app/(home)/layout.tsx"],
  },
  reviews: {
    // Review texts (data/reviews.json) hold no class names, so they are not scanned.
    css: "reviews/reviews.css",
    sources: [...SHARED, "reviews", "../../../app/(reviews)/layout.tsx"],
  },
};
const pageName = process.argv.slice(2).find((a) => !a.startsWith("--"));
const page = PAGES[pageName];
if (!page) {
  console.error(`usage: prune-css.mjs <${Object.keys(PAGES).join("|")}> [--dry-run]`);
  process.exit(1);
}
const cssFile = path.join(siteDir, page.css);

function walk(p) {
  if (!fs.statSync(p).isDirectory()) return [p];
  return fs.readdirSync(p, { withFileTypes: true }).flatMap((e) => {
    const child = path.join(p, e.name);
    return e.isDirectory() ? walk(child) : /\.(tsx?|json)$/.test(e.name) ? [child] : [];
  });
}

// Every word-like token in the page's components, data and root layout counts as "used".
const sources = page.sources.flatMap((s) => walk(path.join(siteDir, s)));
const tokens = new Set();
const prefixes = new Set();
for (const file of sources) {
  const text = fs.readFileSync(file, "utf8");
  for (const m of text.matchAll(/[A-Za-z_][\w-]*/g)) tokens.add(m[0]);
  // Template-literal class names such as `sst-qo__offer-cell--${offer.type}`.
  for (const m of text.matchAll(/([A-Za-z_][\w-]*[-_])\$\{/g)) prefixes.add(m[1]);
}
const used = (name) => tokens.has(name) || [...prefixes].some((p) => name.startsWith(p));

/** Attributes whose exact values name a tab or group; a value the clone never renders can't match. */
const KEYED_ATTRS = new Set([
  "data-tab",
  "data-active-tab",
  "data-group",
  "data-qo-group",
  "data-qo-family",
  "data-qo-family-tab",
  "data-qo-subgroup",
  "data-qo-subgroup-tab",
  "data-qo-legacy-group",
]);

const OPTIONAL_PSEUDOS =new Set([":not", ":is", ":where", ":has", ":matches", ":-webkit-any", ":-moz-any"]);

function selectorUsable(sel) {
  let ok = true;
  selectorParser((rootSel) => {
    rootSel.walk((node) => {
      if (!ok) return false;
      if (node.type === "pseudo" && OPTIONAL_PSEUDOS.has(node.value.toLowerCase())) {
        // Classes inside these are optional for a match; skip their contents.
        return;
      }
      let parent = node.parent;
      while (parent) {
        if (parent.type === "pseudo" && OPTIONAL_PSEUDOS.has(parent.value.toLowerCase())) return;
        parent = parent.parent;
      }
      if ((node.type === "class" || node.type === "id") && !used(node.value)) ok = false;
      if (node.type === "attribute" && node.attribute === "data-sst-theme" && /dark/.test(node.value ?? "")) ok = false;
      // Tab/group keys of the removed game tabs (onepiece, yugioh, psa10, ...).
      if (node.type === "attribute" && KEYED_ATTRS.has(node.attribute) && node.operator === "=" && node.value && !used(node.value)) ok = false;
    });
  }).processSync(sel);
  return ok;
}

const css = fs.readFileSync(cssFile, "utf8");
const ast = postcss.parse(css);
let droppedRules = 0;
let droppedSelectors = 0;

ast.walkRules((rule) => {
  if (rule.parent?.type === "atrule" && /keyframes$/i.test(rule.parent.name)) return;
  const keep = rule.selectors.filter((s) => {
    try {
      return selectorUsable(s);
    } catch {
      return true;
    }
  });
  droppedSelectors += rule.selectors.length - keep.length;
  if (keep.length === 0) {
    rule.remove();
    droppedRules++;
  } else if (keep.length !== rule.selectors.length) {
    rule.selectors = keep;
  }
});

// Keyframes and font faces nobody references any more.
const decls = [];
ast.walkDecls((d) => {
  if (d.parent?.type === "atrule" && d.parent.name === "font-face") return;
  decls.push(d);
});
const animationText = decls.filter((d) => /^(-webkit-)?animation(-name)?$/i.test(d.prop)).map((d) => d.value).join(" ");
const fontText = decls.filter((d) => /^font(-family)?$|^--/i.test(d.prop)).map((d) => d.value).join(" ");
let droppedAtRules = 0;
ast.walkAtRules((at) => {
  if (/keyframes$/i.test(at.name) && !new RegExp(`(^|[\\s,])${at.params.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}($|[\\s,])`).test(animationText)) {
    at.remove();
    droppedAtRules++;
  } else if (at.name === "font-face") {
    let family = "";
    at.walkDecls("font-family", (d) => (family = d.value.replace(/["']/g, "").trim()));
    if (family && !fontText.includes(family)) {
      at.remove();
      droppedAtRules++;
    }
  }
});

// Empty containers (@media, @supports, ...).
let changed = true;
while (changed) {
  changed = false;
  ast.walkAtRules((at) => {
    if (at.nodes && at.nodes.length === 0) {
      at.remove();
      changed = true;
    }
  });
}

const out = ast.toString().replace(/\n{3,}/g, "\n\n");
console.log(
  `rules dropped: ${droppedRules}, selectors dropped: ${droppedSelectors}, at-rules dropped: ${droppedAtRules}, ` +
    `size ${(css.length / 1024).toFixed(0)} KB -> ${(out.length / 1024).toFixed(0)} KB`,
);
if (!dryRun) fs.writeFileSync(cssFile, out);
