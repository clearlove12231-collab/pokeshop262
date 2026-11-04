# Samurai Sword Tokyo — page brief

Source: https://samuraiswordtokyo.com/ko/?qo_tab=pokemon and /ko/pages/reviews (WordPress + WooCommerce, captured 2026-11-04)

## Route map

| Source | Local | Files |
| --- | --- | --- |
| `/ko/?qo_tab=pokemon` | `/ko?qo_tab=pokemon` | `src/app/(home)/ko/page.tsx` → `SamuraiSwordHome.tsx` |
| `/` (template home) | redirects to `/ko?qo_tab=pokemon` | `src/app/(home)/page.tsx` |
| `/ko/pages/reviews` (+ `?rv_page`, `rv_stars`, `rv_photos`, `rv_group`, `rv_sort`) | same path and parameters | `src/app/(reviews)/ko/pages/reviews/page.tsx` → `reviews/ReviewsPage.tsx` |
| `/ko/pages/reviews-pokemon`, `-one-piece`, `-psa10` (category chips) | `/ko/pages/reviews?rv_group=pokemon` / `onepiece` / `psa10` | same page |

Each route group has its own root layout because the source pages use different `<html>`/`<body>` classes
(`home` vs `sst-rvp-page`), which the site CSS keys on. Both render `SiteDocument` + `SiteChrome`.

The review bar ("전체 고객 리뷰 보기") and the footer "고객 리뷰" link open the local reviews page.
Everything else (product pages, account, cart/checkout, other locales, other game tabs) is not cloned. Those links are
blocked so visitors stay on the clone: `sourceHref()` renders them as `#` and `LinkGuard` cancels the click.
Set `LINK_TO_SOURCE = true` in `paths.ts` to send them to the live site again. Social links (Instagram, TikTok, X, Pinterest) are unchanged.

## Scope

Home: Pokémon tab with the products the page renders before scrolling (129 rows):
Preorder/HOT 5 · Box 24 of 87 · PSA10 49 of 410 · Bulk 3 · Special 24 of 63 · Vintage 24 of 30.
Data: `data/quick-order.json` (from the page HTML and the `samurai_qo_group` endpoint; ratings read from the live DOM).

Reviews: all 934 reviews the source lists (39 pages × 24), with 403 photos. Data: `data/reviews.json`.
The source's headline numbers (1,502 reviews, star counts, chip counts) cover more ratings than it lists; they are shown as-is,
while filtered totals count the listed reviews. Category chips use the product name (Pokemon / One Piece / PSA10 / other).
Not mirrored: 6 review videos (~178 MB) and the 300px 2× photo thumbnails.

## Sections — home (top → bottom)

1. Rank band (28px) — sign-up prompt.
2. Sticky header (59px desktop): logo, search + nav links + dark-mode toggle, socials, language `<details>`, icon links, cart.
   Mobile: hamburger → slide-in `.sst-nav-wrap` (`body.sst-nav-open`).
3. Hero slider (275px @1440): 9 slides. Desktop position is CSS `[data-active=N]` → `translateX(-N00%)`;
   touch devices get a scroll-snap strip (`(hover:none) and (pointer:coarse)`). No autoplay observed.
4. Review bar (49px): 4.9/5, 1,502 verified, 4 photo thumbs → local reviews page.
5. Quick order: family tabs (custom display fonts, labels squeezed with `scaleX`), sub-tabs
   (전체/박스/PSA10/벌크/스페셜/빈티지), toolbar (search, in/out-of-stock, price range, sort, popular chips),
   card grid (`tbody` = grid, `tr` = card; 5 columns @1440, 2 @375), coupon tile as card #1.
   "전체" shows all groups with one toolbar and hides rows already in Preorder/HOT; a sub-tab shows one group with its own toolbar.
6. Footer: legal links, currency note, mark + copyright.
7. Floating: gacha promo (close → confirm dialog), Order help chat launcher/panel, cart drawer (`body.sst-cart-open`).
   An empty Google merchant-widget slot sits before the footer (in flow ≤1024px, adding 24px).

## Sections — reviews

Breadcrumb, h1, intro, summary (4.9 + star bars → `?rv_stars=N`), disclosure, "리뷰가 많은 상품" rail (12 cards),
toolbar (category chips, star chips, sort `<form method=get>` submitting on change, total), review list (2 columns @1440,
1 @375; product link, "함께 리뷰한 상품", star rating, author/verified/date, text, photo thumbnails),
WordPress-style pager (end 1, mid 2: `1 2 3 … 39 다음`), "카테고리별 쇼핑" CTA.
Photo thumbnails open `.sst-review-lightbox` (full 1024px image; closes on ×, Esc, backdrop).

## Prices (clone-specific)

Shown in KRW: source JPY × `JPY_TO_KRW` × `PRICE_FACTOR`, rounded to `ROUND_STEP`; no-shrink boxes are priced
`NOSHRINK_DISCOUNT` below the sealed box. All in `price.ts`.

## Styling

`samuraiswordtokyo.css` is the source's own stylesheets (both pages, in cascade order), pruned to selectors used by these components.
The CSS keys on data attributes (`data-handle`, `data-qo-action-state`, `data-qo-subgroup`, …) and body classes, so components keep them.
Dark mode: `html[data-sst-theme="dark"]` + `localStorage['sst-theme']`.
Fonts: Figtree (Google, self-hosted), SST Tab fonts (Archivo Black, Rounded, Anton, Cinzel, Black Ops One); Korean falls back to system fonts as on the source.

## Assets

1,250 files in `public/sites/samuraiswordtokyo/` (~73 MB, mostly review photos), mirroring source paths under `wp-content/`.
Map: `asset-map.json`. Re-download: `node --use-system-ca scripts/samuraiswordtokyo/download-assets.mjs`.
