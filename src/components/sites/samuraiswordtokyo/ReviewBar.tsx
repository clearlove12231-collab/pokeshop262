/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
import { SOURCE_ORIGIN, src } from "./paths";

const REVIEW_PHOTOS = [
  src("/uploads/2026/11/sst-review-rSFhMfZtngo2-150x150.webp"),
  src("/uploads/2026/11/sst-review-X9ZgrHDJXABx-150x150.webp"),
  src("/uploads/2026/11/sst-review-B5mt2ivUYWpS-150x150.webp"),
  src("/uploads/2026/11/sst-review-YF9PFmzQ1Ih8-150x150.webp"),
];
const STAR_FILLS = ["100%", "100%", "100%", "100%", "75%"];

/**
 * Store-wide review summary (source values captured 2026-11-04). The reviews
 * page is not part of the clone, so the link opens the live page in a new tab.
 */
export function ReviewBar() {
  return (
    <section className="sst-hrb sst-hrb--glyph" aria-label="고객 리뷰">
      <a className="sst-hrb__link" href={`${SOURCE_ORIGIN}/ko/pages/reviews`} target="_blank" rel="noopener">
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
          <span className="sst-hrb__verified-long">구매 인증 고객 1,504명의 평가</span>
          <span className="sst-hrb__verified-short">구매 인증 고객 1,504명</span>
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
