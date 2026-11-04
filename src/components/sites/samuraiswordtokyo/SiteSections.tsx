/* eslint-disable @next/next/no-img-element */
import { LOGO, SHOP_NAME, TIKTOK_URL } from "./brand";

/** Top announcement band: how to order. */
export function RankBand() {
  return (
    <div id="sst-rank-band" className="sst-rb" data-state="guest" data-lang="ko">
      <a className="sst-rb__link sst-rb__link--guest" href={TIKTOK_URL} target="_blank" rel="noopener">
        <span className="sst-rb__text">
          <span className="sst-rb__t1">상품 주문 문의는 TikTok DM으로 받고 있습니다</span>
        </span>
        <span className="sst-rb__chev" aria-hidden="true" />
      </a>
    </div>
  );
}

const FOOTER_LINKS: { label: string; href: string; external?: boolean }[] = [
  { label: "쇼핑", href: "/ko?qo_tab=pokemon" },
  { label: "주문 문의 (TikTok DM)", href: TIKTOK_URL, external: true },
];

export function SiteFooter() {
  return (
    <footer className="sst-footer">
      <div className="sst-container sst-footer__inner">
        <ul className="sst-footer__legal">
          {FOOTER_LINKS.map((l) => (
            <li key={l.label}>
              <a href={l.href} {...(l.external ? { target: "_blank", rel: "noopener" } : {})}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="sst-footer__locale" aria-label="스토어 통화">
          <span className="sst-footer__locale-note">가격은 원화(KRW)로 표시됩니다.</span>
        </div>
      </div>
      <div className="sst-footer__bottom">
        <div className="sst-container sst-footer__bottom-inner">
          <img className="sst-footer__mark shop-footer-mark" src={LOGO} alt={SHOP_NAME} width={36} height={36} />
          <small>
            © 2026, <a href="/ko?qo_tab=pokemon">{SHOP_NAME}</a>
          </small>
        </div>
      </div>
    </footer>
  );
}
