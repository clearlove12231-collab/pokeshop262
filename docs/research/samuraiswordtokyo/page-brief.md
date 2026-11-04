# Pokeshop — site notes

The page layout and quick-order catalog UI started from a clone of a Japanese TCG store's homepage
(captured 2026-11-04). The site has since been rebranded as **Pokeshop** (TikTok @pokeshopkr):
the other store's name, logo, banners, campaigns, reviews/ratings, coupons, policy links and product
photos were removed. Folder and CSS class names (`samuraiswordtokyo`, `sst-*`) are internal only.

## Routes

| Path | File |
| --- | --- |
| `/ko?qo_tab=pokemon` | `src/app/(home)/ko/page.tsx` → `SamuraiSwordHome.tsx` |
| `/` | redirects to `/ko?qo_tab=pokemon` |

## Shop settings

- `brand.ts` — shop name, tagline, TikTok handle/URL, logo and placeholder image paths.
- `public/shop/logo.webp` — the round shop logo (header, hero, footer, order notice, favicon).
- `public/shop/product-placeholder.svg`, `card-placeholder.svg` — shown until real product photos are added.
- `price.ts` — display prices: source JPY × `JPY_TO_KRW` × `PRICE_FACTOR`, rounded to `ROUND_STEP`;
  no-shrink boxes `NOSHRINK_DISCOUNT` below sealed.

## Ordering flow

Cart drawer → **주문하기** → order notice: "상품 주문 문의는 TikTok DM으로 부탁드립니다", the order lines and
total, **주문 내용 복사** (copies a text summary) and **TikTok DM으로 문의하기** (opens the TikTok profile).
The announcement band, header "주문 문의", hero button, floating "주문 문의" panel and footer all point to TikTok.
No payment is taken on the site; the cart lives in the visitor's browser (localStorage).

## Before publishing — owner to-do

`data/quick-order.json` still holds the starting catalog: product names, JAN codes, prices, stock counts and badges.
Replace them with your own products, prices and real stock, and set `img.src` for each product to your own photo
(e.g. put files in `public/shop/products/` and use `/shop/products/<file>`).

## Styling

`samuraiswordtokyo.css` — base site styles (pruned to the classes in use). `shop.css` — logo, hero, order notice.
Dark mode: `html[data-sst-theme="dark"]` + `localStorage['sst-theme']`.
Fonts: Figtree + display fonts for the category tabs (self-hosted in `public/sites/samuraiswordtokyo/`).
