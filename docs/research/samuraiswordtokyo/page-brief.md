# Samurai Sword Tokyo — page brief

Source: https://samuraiswordtokyo.com/ko/?qo_tab=pokemon (WordPress + WooCommerce, captured 2026-11-04)

## Route map

| Source | Local | Files |
| --- | --- | --- |
| `/ko/?qo_tab=pokemon` | `/ko?qo_tab=pokemon` | `src/app/ko/page.tsx` → `src/components/sites/samuraiswordtokyo/SamuraiSwordHome.tsx` |
| `/` (template home) | redirects to `/ko?qo_tab=pokemon` | `src/app/page.tsx` |

Everything else (product pages, account, cart/checkout, other locales, other game tabs) links to the live site.

## Scope

Pokémon tab with the products the page renders before scrolling (129 rows):
Preorder/HOT 5 · Box 24 of 87 · PSA10 49 of 410 · Bulk 3 · Special 24 of 63 · Vintage 24 of 30.
Data: `data/quick-order.json` (from the page HTML and the `samurai_qo_group` endpoint; ratings read from the live DOM).

## Sections (top → bottom)

1. Rank band (28px) — sign-up prompt.
2. Sticky header (59px desktop): logo, search + nav links + dark-mode toggle, socials, language `<details>`, icon links, cart.
   Mobile: hamburger → slide-in `.sst-nav-wrap` (`body.sst-nav-open`).
3. Hero slider (275px @1440): 9 slides. Desktop position is CSS `[data-active=N]` → `translateX(-N00%)`;
   touch devices get a scroll-snap strip (`(hover:none) and (pointer:coarse)`). No autoplay observed.
4. Review bar (49px): 4.9/5, 1,502 verified, 4 photo thumbs.
5. Quick order: family tabs (custom display fonts, labels squeezed with `scaleX`), sub-tabs
   (전체/박스/PSA10/벌크/스페셜/빈티지), toolbar (search, in/out-of-stock, price range, sort, popular chips),
   card grid (`tbody` = grid, `tr` = card; 5 columns @1440, 2 @375), coupon tile as card #1.
   "전체" shows all groups with one toolbar and hides rows already in Preorder/HOT; a sub-tab shows one group with its own toolbar.
6. Footer: legal links, JPY note, mark + copyright.
7. Floating: gacha promo (close → confirm dialog), Order help chat launcher/panel, cart drawer (`body.sst-cart-open`).

## Styling

`samuraiswordtokyo.css` is the source's own stylesheets in cascade order, pruned to selectors used by these components.
The CSS keys on data attributes (`data-handle`, `data-qo-action-state`, `data-qo-subgroup`, …), so components keep them.
Dark mode: `html[data-sst-theme="dark"]` + `localStorage['sst-theme']`.
Fonts: Figtree (Google, self-hosted), SST Tab fonts (Archivo Black, Rounded, Anton, Cinzel, Black Ops One); Korean falls back to system fonts as on the source.

## Assets

303 files in `public/sites/samuraiswordtokyo/` (7.8 MB), mirroring source paths under `wp-content/`.
Map: `asset-map.json`. Re-download: `node --use-system-ca scripts/samuraiswordtokyo/download-assets.mjs`.
