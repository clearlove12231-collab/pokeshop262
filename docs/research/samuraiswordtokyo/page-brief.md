# Samurai Sword Tokyo — Pokemon tab clone

Source: https://samuraiswordtokyo.com/ko/?qo_tab=pokemon (WordPress + WooCommerce, captured 2026-11-04)

## Route map

| Source | Local | Files |
| --- | --- | --- |
| `/ko/?qo_tab=pokemon` | `/ko?qo_tab=pokemon` | `src/app/ko/page.tsx` → `src/components/sites/samuraiswordtokyo/SamuraiSwordHome.tsx` |
| `/` (template home) | redirects to `/ko?qo_tab=pokemon` | `src/app/page.tsx` |

## Scope (owner's requirements)

- Only the **Pokemon** quick-order tab. The other game tabs (TOP, 쿠폰, 원피스, Yu-Gi-Oh, Dragon Ball,
  손상 박스, PSA10) are removed.
- **No individual PSA cards**: the PSA10 sub-tab/group is not cloned and the bulk row
  "Random PSA10 (AR or Higher) - 1 Card" is dropped (`isPsaSingle()` in the extractor).
- Kept essentials only: header (logo + cart button), review bar, the Pokemon tab, cart drawer.
  Removed: rank band, header nav/search/socials/language/account/coupon/dark mode, campaign slider,
  B2B intro, coupon tile, "sets" section, footer, gacha promo, order-help chat, watchlist stars,
  restock "Notify" buttons.
- **Nothing leads to the source site**: no links, new tabs or click handlers point at samuraiswordtokyo.com
  (product blocks, ratings and the review bar are not links), and every image/font is served locally.
- **Prices**: 58% of the source price, converted to KRW and rounded to the nearest ₩5,000
  (`price.ts`: `yen × JPY_TO_KRW (8.4888) × PRICE_FACTOR (0.58)`, `ROUND_STEP 5000`, minimum ₩5,000).
  Data keeps the source JPY prices; the slider/filters work in JPY and display KRW.

## Catalog

`data/quick-order.json` — 187 products, built by `node --use-system-ca scripts/samuraiswordtokyo/extract-catalog.mjs`
from the page HTML (Preorder/HOT rows, review-star data) and the store's group endpoint
(`/ko?samurai_qo_group=1&action=samurai_qo_group&group=…`, 24 rows per request).

| Group | Rows |
| --- | --- |
| 예약 주문 / HOT | 5 |
| 포켓몬 박스 | 87 |
| 포켓몬 벌크 | 2 (source 3, PSA single dropped) |
| 포켓몬 스페셜 | 63 |
| Pokemon Vintage | 30 |

The group endpoint returns English offer labels (Item / Sealed / No Shrink) while the first group renders Korean
ones; the extractor uses the Korean labels everywhere.

## Sections (top → bottom)

1. Sticky header (59px desktop, 53px mobile): logo, cart toggle with item count.
2. Review bar: 4.9/5, 1,504 verified, 469 photo reviews. Plain content: the source's link to its reviews
   page and the "전체 고객 리뷰 보기" CTA are removed.
3. Quick order: Pokemon tab; sub-tabs 전체/박스/벌크/스페셜/빈티지; toolbar (search incl. JAN, In/Out of stock,
   price slider, sort, Popular Pokemon chips); card grid. "전체" shows every group with one toolbar and hides rows
   already in Preorder/HOT. Each group shows 24 rows and loads 24 more when its status line comes within 480px of
   the viewport ("Scroll to load more products (24 / 87 shown)."), like the source.
4. Cart drawer (`body.sst-cart-open`): lines, quantity steppers, remove, subtotal. Checkout is not part of the clone;
   the cart lives in localStorage (`sst-clone-cart-v2`).

## Styling

`samuraiswordtokyo.css` is the source's stylesheets in cascade order, pruned with
`node scripts/samuraiswordtokyo/prune-css.mjs` to selectors the components can match (dark theme and removed tabs dropped).
Fonts: Figtree, Inter, Archivo (self-hosted), SST Tab Rounded for the Pokemon tab.

## Assets

`public/sites/samuraiswordtokyo/` mirrors source paths under `wp-content/`. Map: `asset-map.json`.
Re-download / prune: `node --use-system-ca scripts/samuraiswordtokyo/download-assets.mjs --prune`.
