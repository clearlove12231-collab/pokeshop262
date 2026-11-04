/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
import { SOURCE, src } from "./paths";

export function RankBand() {
  return (
    <div id="sst-rank-band" className="sst-rb" data-state="guest" data-lang="ko">
      <a className="sst-rb__link sst-rb__link--guest" href={`${SOURCE}/ko/my-account?register=1`}>
        <span className="sst-rb__text">
          <span className="sst-rb__t1">무료 회원가입으로 포인트 적립과 등급을 시작하세요</span>
        </span>
        <span className="sst-rb__chev" aria-hidden="true" />
      </a>
    </div>
  );
}

const REVIEW_PHOTOS = [
  src("/uploads/2026/11/sst-review-rSFhMfZtngo2-150x150.webp"),
  src("/uploads/2026/11/sst-review-X9ZgrHDJXABx-150x150.webp"),
  src("/uploads/2026/11/sst-review-B5mt2ivUYWpS-150x150.webp"),
  src("/uploads/2026/11/sst-review-YF9PFmzQ1Ih8-150x150.webp"),
];
const STAR_FILLS = ["100%", "100%", "100%", "100%", "75%"];

export function ReviewBar() {
  return (
    <section className="sst-hrb sst-hrb--glyph" aria-label="고객 리뷰">
      <a className="sst-hrb__link" href={`${SOURCE}/ko/pages/reviews`}>
        <span className="sst-hrb__label" aria-hidden="true">
          고객 리뷰
        </span>
        <span className="sst-hrb__stars" role="img" aria-label="5 중에서 4.9로 평가됨">
          {STAR_FILLS.map((f, i) => (
            <i key={i} className="sst-hrb-star" style={{ "--f": f } as CSSProperties} />
          ))}
        </span>
        <span className="sst-hrb__score">
          <b>4.9</b>
          <span className="sst-hrb__of">/5</span>
        </span>
        <span className="sst-hrb__verified">
          <svg className="sst-hrb__check" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-1.3 14.6-4.3-4.3 1.4-1.4 2.9 2.9 6.1-6.1 1.4 1.4-7.5 7.5z" />
          </svg>
          <span className="sst-hrb__verified-long">구매 인증 고객 1,502명의 평가</span>
          <span className="sst-hrb__verified-short">구매 인증 고객 1,502명</span>
        </span>
        <span className="sst-hrb__br" aria-hidden="true" />
        <span className="sst-hrb__photos">
          <span className="sst-hrb__thumbs" role="img" aria-label="사진 있는 리뷰 469개">
            {REVIEW_PHOTOS.map((photo) => (
              <img key={photo} src={photo} alt="" width={28} height={28} />
            ))}
          </span>
          <span className="sst-hrb__photos-label" aria-hidden="true">
            사진 있는 리뷰 469개
          </span>
        </span>
        <span className="sst-hrb__share">93%가 별 5개 평가</span>
        <span className="sst-hrb__cta">
          전체 고객 리뷰 보기
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
      </a>
    </section>
  );
}

const FOOTER_LINKS: [string, string][] = [
  ["개인정보 선택", "/ko/pages/data-sharing-opt-out"],
  ["이용약관", "/ko/policies/terms-of-service"],
  ["반품 및 환불 정책", "/ko/pages/return-and-refund-policy"],
  ["개인정보 처리방침", "/ko/policies/privacy-policy"],
  ["FAQ", "/ko/pages/faq"],
  ["문의", "/ko/pages/contact"],
  ["법적 고지", "/ko/pages/legal-notice"],
  ["관세 및 수입세", "/ko/pages/customs-duties-and-import-taxes"],
  ["배송 정책", "/ko/policies/shipping-policy"],
  ["상품 상태 가이드", "/ko/pages/product-condition-guide"],
  ["고객 리뷰", "/ko/pages/reviews"],
  ["결제 수단", "/ko/pages/payment-methods"],
  ["쿠폰 이용약관", "/ko/pages/coupon-terms"],
  ["회사 소개", "/ko/pages/about"],
];

export function SiteFooter() {
  return (
    <footer className="sst-footer">
      <div className="sst-container sst-footer__inner">
        <ul className="sst-footer__legal">
          {FOOTER_LINKS.map(([label, path]) => (
            <li key={path}>
              <a href={`${SOURCE}${path}`}>{label}</a>
            </li>
          ))}
        </ul>
        <div className="sst-footer__locale" aria-label="스토어 통화">
          <span className="sst-footer__locale-note">가격은 JPY로 표시됩니다.</span>
        </div>
      </div>
      <div className="sst-footer__bottom">
        <div className="sst-container sst-footer__bottom-inner">
          <img className="sst-footer__mark" src={src("/themes/samurai-sword/assets/samurai-sword-mark-square.svg")} alt="Samurai Sword Tokyo" width={36} height={36} />
          <small>
            © 2026, <a href="/ko?qo_tab=pokemon">SamuraiSwordTokyo</a>
          </small>
        </div>
      </div>
    </footer>
  );
}
