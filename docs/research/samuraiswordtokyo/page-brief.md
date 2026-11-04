# Samurai Sword Tokyo — Pokemon tab clone

Sources (WordPress + WooCommerce, captured 2026-11-04):
https://samuraiswordtokyo.com/ko/?qo_tab=pokemon and https://samuraiswordtokyo.com/ko/pages/reviews-pokemon

## Route map

| Source | Local | Files |
| --- | --- | --- |
| `/ko/?qo_tab=pokemon` | `/ko?qo_tab=pokemon` | `src/app/(home)/ko/page.tsx` → `SamuraiSwordHome.tsx` |
| `/` (template home) | redirects to `/ko?qo_tab=pokemon` | `src/app/(home)/page.tsx` |
| `/ko/pages/reviews-pokemon` (+ `rv_photos`, `rv_stars`, `rv_sort`, `rv_page`) | same path and parameters | `src/app/(reviews)/ko/pages/reviews-pokemon/page.tsx` → `reviews/ReviewsPage.tsx` |

Each route group has its own root layout because the two source pages use different `<body>` classes
(`home …` vs `sst-rvp-page …`), which their stylesheets key on. Switching between them is a full page load,
so each page loads only its own stylesheet. Both render `SiteChrome` (header + cart drawer).

## Scope (owner's requirements)

- Only the **Pokemon** quick-order tab. The other game tabs (TOP, 쿠폰, 원피스, Yu-Gi-Oh, Dragon Ball,
  손상 박스, PSA10) are removed.
- **No individual PSA cards**: the PSA10 sub-tab/group is not cloned and the bulk row
  "Random PSA10 (AR or Higher) - 1 Card" is dropped (`isPsaSingle()` in the extractors).
- Kept essentials only: header (logo + cart button), review bar, the Pokemon tab, cart drawer, and the
  Pokemon reviews page. Removed: rank band, header nav/search/socials/language/account/coupon/dark mode,
  campaign slider, B2B intro, coupon tile, "sets" section, footer, gacha promo, order-help chat,
  watchlist stars, restock "Notify" buttons.
- **Nothing leads to the source site**: no links, new tabs or click handlers point at samuraiswordtokyo.com
  (product blocks, ratings and review products are not links), and every image/font is served locally.
- **Reviews: Pokemon only.** Other categories (원피스, PSA 10, 기타 상품) and the all-reviews page are not cloned.
  All review numbers (home bar and reviews page) are counted from the cloned reviews.
- **Prices** (`price.ts`): 58% of the source price, converted to KRW and rounded to the nearest ₩5,000, plus ₩50,000:
  `round5000(yen × JPY_TO_KRW (8.4888) × PRICE_FACTOR (0.58)) + PRICE_MARKUP_WON (50,000)` — e.g. ¥10,000 → ₩100,000.
  A "슈링크 없음" offer costs `NOSHRINK_DISCOUNT` (15%) less than the same product's sealed offer (its paid price),
  rounded to ₩5,000 and always below it — e.g. 밀봉 ₩150,000 → 슈링크 없음 ₩130,000.
  Sale prices get the same markup; when rounding makes the regular and sale price equal, no sale (badge, struck
  price, sale styling) is shown. Data keeps the source JPY prices; the slider/filters work in JPY and display KRW.
- **Sold out** (`shop.ts`): every product of "포켓몬 스페셜" (`pokemon-other`) and "포켓몬 벌크" (`pokemon-bulk`),
  including their copies in "예약 주문 / HOT", is shown as 품절 (stock "품절", no quantity stepper, price kept), and
  the stock filters/sort treat them as out of stock. Applied when the page loads the catalog, so re-extracting the
  data keeps the rule. The cart storage key is bumped (`sst-clone-cart-v3`) whenever prices/stock rules change.

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

## Reviews

`data/reviews.json` — every review the source lists on its Pokemon reviews page (24 pages × 24): 561 reviews,
185 with photos (219 photos), all from verified buyers, no PSA singles, no videos. Built by
`node --use-system-ca scripts/samuraiswordtokyo/extract-reviews.mjs`. Products are stored by name and image only.

Counted from these reviews (`STATS` / `TOP_PRODUCTS` in `reviews/query.ts`): 4.9 (4.875), 561 reviews,
5★ 528 · 4★ 16 · 3★ 6 · 2★ 2 · 1★ 9, 94% five-star, 185 with photos, 74 products. The source's own category
headline (834 reviews, 245 with photos, 86 products) also counts ratings it never lists.

## Sections — home (top → bottom)

1. Sticky header (59px desktop, 53px mobile): logo, cart toggle with item count.
2. Review bar → `/ko/pages/reviews-pokemon`: 4.9/5, "구매 인증 고객 561명의 평가", newest 4 review photos,
   "사진 있는 리뷰 185개", "94%가 별 5개 평가" (≥1200px), "전체 고객 리뷰 보기 →".
3. Quick order: Pokemon tab; sub-tabs 전체/박스/벌크/스페셜/빈티지; toolbar (search incl. JAN, In/Out of stock,
   price slider, sort, Popular Pokemon chips); card grid. "전체" shows every group with one toolbar and hides rows
   already in Preorder/HOT. Each group shows 24 rows and loads 24 more when its status line comes within 480px of
   the viewport ("Scroll to load more products (24 / 87 shown)."), like the source.
4. Cart drawer (`body.sst-cart-open`): lines, quantity steppers, remove, subtotal and a filled "결제하기" button
   (the source's `.button.alt`). No payment is taken: "결제하기" opens a notice (`CartDrawer.tsx`, `cart-notice.css`)
   — "상세 패키지 구매문의는 https://www.tiktok.com/@pokeshopkr 으로 부탁드립니다." — with a
   "TikTok으로 이동하기" button to `INQUIRY_URL` (`shop.ts`) in a new tab. Esc closes the notice, then the drawer.
   The cart lives in localStorage (`sst-clone-cart-v3`) and is shared by both pages.

## Sections — reviews

Breadcrumb (홈 → home), h1 "포켓몬 카드 리뷰", intro, summary (score + star bars), disclosure,
"리뷰가 많은 상품" rail (12 cards, 6 columns; swipe strip ≤720px), toolbar, review list (2 columns; 1 ≤900px),
WordPress-style pager (`1 2 3 … 24 다음`). Photo thumbnails open `.sst-review-lightbox` (1024px image,
`body.sst-review-lightbox-open` locks scroll; closes on ×, Esc, backdrop).

URL rules copied from the source: `rv_photos=1` and `rv_stars=N` combine; every chip, star bar and pager link keeps
the other filters and `rv_sort` (not `rv_page`); clicking an active chip/bar removes it; "필터 초기화" clears all.
The sort `<form method=get>` submits on change with hidden `rv_group=pokemon`, `rv_photos`, `rv_stars`.

Removed from the source page because they lead to the source store: "← 전체 고객 리뷰 보기", the 전체/원피스/PSA 10/
기타 상품 chips, product links and "상품 보기 →", "함께 리뷰한 상품" links (kept as plain names),
"카테고리별 쇼핑" buttons.

## Styling

- Home: `samuraiswordtokyo.css`, the source's stylesheets in cascade order.
- Reviews: `reviews/reviews.css`, rebuilt from the live page with
  `node --use-system-ca scripts/samuraiswordtokyo/build-page-css.mjs https://samuraiswordtokyo.com/ko/pages/reviews-pokemon src/components/sites/samuraiswordtokyo/reviews/reviews.css`
  (links + inline styles in document order; async `media="print"` font CSS treated as screen; Google Fonts reduced to
  latin/latin-ext). `reviews/clone.css` holds the two clone-only tweaks for the de-linked product blocks.
- Both pruned with `node scripts/samuraiswordtokyo/prune-css.mjs home|reviews` to selectors each page's components can
  match (dark theme and removed tabs dropped).
- Fonts: Figtree (both), Inter and Archivo (home), SST Tab Rounded for the Pokemon tab — all self-hosted.

## Assets

`public/sites/samuraiswordtokyo/` mirrors source paths under `wp-content/` (828 files, ~43 MB, mostly review photos).
Map: `asset-map.json`. Re-download / prune: `node --use-system-ca scripts/samuraiswordtokyo/download-assets.mjs --prune`
(retries the store's intermittent TLS failures).
