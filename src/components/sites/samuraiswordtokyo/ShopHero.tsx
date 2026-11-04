/* eslint-disable @next/next/no-img-element */
import { LOGO, SHOP_NAME, SHOP_TAGLINE, TIKTOK_HANDLE, TIKTOK_URL } from "./brand";

/** Top banner of the shop (replaces the source's campaign slider). */
export function ShopHero() {
  return (
    <section className="shop-hero" aria-label={SHOP_NAME}>
      <div className="shop-hero__inner">
        <img className="shop-hero__logo" src={LOGO} alt={SHOP_NAME} width={1080} height={1080} />
        <div className="shop-hero__copy">
          <p className="shop-hero__tagline">{SHOP_TAGLINE}</p>
          <h1 className="shop-hero__title">{SHOP_NAME}</h1>
          <p className="shop-hero__text">
            상품을 장바구니에 담은 뒤, 주문 문의는 <b>TikTok DM</b>으로 보내 주세요.
          </p>
          <a className="shop-hero__cta" href={TIKTOK_URL} target="_blank" rel="noopener">
            TikTok DM 문의 <span aria-hidden="true">→</span>
          </a>
          <p className="shop-hero__handle">{TIKTOK_HANDLE}</p>
        </div>
      </div>
    </section>
  );
}
