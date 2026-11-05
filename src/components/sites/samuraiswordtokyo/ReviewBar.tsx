"use client";

/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
import type { Family } from "./families";
import { useFamily } from "./family-context";
import { starFills } from "./stars";

const fmt = (n: number) => n.toLocaleString("en-US");

/** What the bar shows for one game tab (counted from that game's cloned reviews). */
export interface ReviewBarData {
  href: string;
  avg: number;
  avgText: string;
  total: number;
  photos: number;
  fiveStarShare: number;
  recentPhotos: string[];
}

/**
 * Review summary bar. It follows the selected game tab: numbers and photos come
 * from the reviews cloned on /ko/pages/reviews-pokemon or /ko/pages/reviews-one-piece,
 * and the bar links to that local page.
 */
export function ReviewBar({ bars }: { bars: Record<Family, ReviewBarData> }) {
  const { family } = useFamily();
  const STATS = bars[family];
  return (
    <section className="sst-hrb sst-hrb--glyph" aria-label="고객 리뷰">
      <a className="sst-hrb__link" href={STATS.href}>
        <span className="sst-hrb__label" aria-hidden="true">
          고객 리뷰
        </span>
        <span className="sst-hrb__stars" role="img" aria-label={`5 중에서 ${STATS.avgText}로 평가됨`}>
          {starFills(STATS.avg).map((f, i) => (
            <i key={i} className="sst-hrb-star" style={{ "--f": f } as CSSProperties} />
          ))}
        </span>
        <span className="sst-hrb__score">
          <b>{STATS.avgText}</b>
          <span className="sst-hrb__of">/5</span>
        </span>
        <span className="sst-hrb__verified">
          <svg className="sst-hrb__check" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-1.3 14.6-4.3-4.3 1.4-1.4 2.9 2.9 6.1-6.1 1.4 1.4-7.5 7.5z" />
          </svg>
          <span className="sst-hrb__verified-long">구매 인증 고객 {fmt(STATS.total)}명의 평가</span>
          <span className="sst-hrb__verified-short">구매 인증 고객 {fmt(STATS.total)}명</span>
        </span>
        <span className="sst-hrb__br" aria-hidden="true" />
        <span className="sst-hrb__photos">
          <span className="sst-hrb__thumbs" role="img" aria-label={`사진 있는 리뷰 ${fmt(STATS.photos)}개`}>
            {STATS.recentPhotos.map((photo) => (
              <img key={photo} src={photo} alt="" width={28} height={28} />
            ))}
          </span>
          <span className="sst-hrb__photos-label" aria-hidden="true">
            사진 있는 리뷰 {fmt(STATS.photos)}개
          </span>
        </span>
        <span className="sst-hrb__share">{STATS.fiveStarShare}%가 별 5개 평가</span>
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
