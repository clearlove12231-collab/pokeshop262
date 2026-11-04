#!/usr/bin/env node
/**
 * Downloads every Samurai Sword Tokyo asset referenced by the clone into
 * public/sites/samuraiswordtokyo, and writes the source -> local map to
 * docs/research/samuraiswordtokyo/asset-map.json.
 *
 * Local paths mirror the source:
 *   /sites/samuraiswordtokyo/<path>            <- https://samuraiswordtokyo.com/wp-content/<path>
 *   /sites/samuraiswordtokyo/wp-includes/<p>   <- https://samuraiswordtokyo.com/wp-includes/<p>
 *   /sites/samuraiswordtokyo/ext/<host>/<path> <- https://<host>/<path>
 *
 * Usage: node --use-system-ca scripts/samuraiswordtokyo/download-assets.mjs [--force]
 * (--use-system-ca lets Node trust the Windows certificate store for fonts.gstatic.com.)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const siteSrc = path.join(root, "src/components/sites/samuraiswordtokyo");
const publicDir = path.join(root, "public");
const mapFile = path.join(root, "docs/research/samuraiswordtokyo/asset-map.json");
const force = process.argv.includes("--force");
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : /\.(tsx?|json|css)$/.test(e.name) ? [p] : [];
  });
}

const PREFIX = "/sites/samuraiswordtokyo";
const localPaths = new Set();
for (const file of walk(siteSrc)) {
  const text = fs.readFileSync(file, "utf8");
  for (const m of text.matchAll(/\/sites\/samuraiswordtokyo(\/[^"'`)\s,]+)/g)) localPaths.add(m[1]);
  for (const m of text.matchAll(/\bsrc\(\s*["'`](\/[^"'`$]+)["'`]\s*\)/g)) localPaths.add(m[1]);
}

function sourceUrl(p) {
  const decoded = decodeURI(p);
  if (decoded.startsWith("/ext/")) {
    const [, , host, ...rest] = decoded.split("/");
    return `https://${host}/${rest.map(encodeURIComponent).join("/")}`;
  }
  const base = decoded.startsWith("/wp-includes/") ? "https://samuraiswordtokyo.com" : "https://samuraiswordtokyo.com/wp-content";
  return base + decoded.split("/").map(encodeURIComponent).join("/");
}

const EXPECTED = /^(image\/|font\/|application\/font|application\/x-font|application\/octet-stream)/;
const map = {};
let downloaded = 0;
let skipped = 0;
const failures = [];

const queue = [...localPaths].sort();
async function worker() {
  while (queue.length) {
    const p = queue.shift();
    const url = sourceUrl(p);
    const dest = path.join(publicDir, PREFIX, decodeURI(p));
    map[url] = PREFIX + p;
    if (!force && fs.existsSync(dest) && fs.statSync(dest).size > 0) {
      skipped++;
      continue;
    }
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA, Referer: "https://samuraiswordtokyo.com/" } });
      const type = res.headers.get("content-type") || "";
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      if (!EXPECTED.test(type)) throw new Error(`unexpected content-type ${type}`);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
      downloaded++;
    } catch (e) {
      failures.push(`${url}: ${e.cause?.code ?? e.message}`);
    }
  }
}
await Promise.all(Array.from({ length: 8 }, worker));

fs.mkdirSync(path.dirname(mapFile), { recursive: true });
fs.writeFileSync(mapFile, JSON.stringify(Object.fromEntries(Object.entries(map).sort()), null, 2) + "\n");
console.log(`assets: ${localPaths.size}, downloaded: ${downloaded}, already present: ${skipped}, failed: ${failures.length}`);
if (failures.length) {
  console.log(failures.join("\n"));
  process.exitCode = 1;
}
