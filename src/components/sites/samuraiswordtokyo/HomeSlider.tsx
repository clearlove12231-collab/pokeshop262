"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { sourceHref, src } from "./paths";

interface Slide {
  className: string;
  label: string;
  dot: string;
  content: ReactNode;
}

function BannerPicture({ mobile, desktop, alt, mq = "(max-width: 899px)", w = 1904, h = 246, mw = 780, mh = 360, className }: {
  mobile: string;
  desktop: string;
  alt: string;
  mq?: string;
  w?: number;
  h?: number;
  mw?: number;
  mh?: number;
  className?: string;
}) {
  return (
    <picture className={className}>
      <source media={mq} srcSet={mobile} width={mw} height={mh} />
      <img src={desktop} alt={alt} width={w} height={h} />
    </picture>
  );
}

const SLIDES: Slide[] = [
  {
    className: "sst-home-slide--samurai-month sstsm-promo-banner",
    label: "Samurai Month",
    dot: "Show Samurai Month banner",
    content: (
      <a className="sst-home-slide__link" href={sourceHref(`/ko/blogs/news/samurai-month-2026`)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src("/plugins/sst-samurai-month/assets/m5_poster_pc.webp")} alt="" width={1536} height={1024} />
        <span className="sstsm-promo-copy">
          <span className="sstsm-promo-date">NOVEMBER 1–30, 2026</span>
          <strong>
            SAMURAI <span>MONTH</span>
          </strong>
          <span className="sstsm-promo-desc">All November long.</span>
          <span className="sstsm-promo-cta">
            Explore the campaign <span aria-hidden="true">→</span>
          </span>
        </span>
      </a>
    ),
  },
  {
    className: "sst-home-slide--megadeck",
    label: "Special Deck Set MEGA pre-order available now",
    dot: "Show Special Deck Set MEGA banner",
    content: (
      <a
        className="sst-home-slide__link"
        href={sourceHref(`/ko/products/special-deck-set-mega-feraligatr-dragonite-gengar-japanese`)}
        aria-label="Special Deck Set MEGA: Mega Feraligatr, Dragonite and Gengar ex, pre-order available now. View product page."
      >
        <BannerPicture
          mobile={src("/themes/samurai-sword/assets/home-banner-megadeck-mobile-20261102-05eb117697.webp")}
          desktop={src("/themes/samurai-sword/assets/home-banner-megadeck-desktop-20261102-51f0320769.webp")}
          alt="Special Deck Set MEGA. Mega Feraligatr, Dragonite and Gengar ex. Available now."
        />
      </a>
    ),
  },
  {
    className: "sst-home-slide--celebration30",
    label: "포켓몬 30th Celebration 박스 지금 구매 가능",
    dot: "30th Celebration 박스 배너 보기",
    content: (
      <a
        className="sst-home-slide__link"
        href={sourceHref(`/ko/products/m6a-30th-celebration-booster-box-japanese`)}
        aria-label="포켓몬 30th Celebration 박스, 밀봉 및 슈링크 없음, 지금 구매 가능. 상품 페이지 보기."
      >
        <BannerPicture
          mobile={src("/themes/samurai-sword/assets/home-banner-celebration30-mobile-20261008-0aec559f22.webp")}
          desktop={src("/themes/samurai-sword/assets/home-banner-celebration30-desktop-20261008-5a98b9180b.webp")}
          alt="포켓몬 30th Celebration 박스. 밀봉 및 슈링크 없음. 지금 구매 가능."
        />
      </a>
    ),
  },
  {
    className: "sst-home-slide--referral",
    label: "친구 추천",
    dot: "친구 추천 배너 보기",
    content: (
      <a
        className="sst-home-slide__link"
        href={sourceHref(`/ko/pages/referral-campaign-preview`)}
        aria-label="친구 추천: 회원님은 2,000포인트, 친구는 1,000포인트를 받습니다. 자세히 보기."
      >
        <BannerPicture
          mobile={src("/themes/samurai-sword/assets/home-banner-referral-mobile-20261006-643271c56e.webp")}
          desktop={src("/themes/samurai-sword/assets/home-banner-referral-desktop-20261006-a8986d54c3.webp")}
          alt="친구 추천. 회원님은 2,000포인트를 받습니다. 친구는 1,000포인트를 받습니다. 자세히 보기."
        />
      </a>
    ),
  },
  {
    className: "sst-home-slide--opmag2",
    label: "ONE PIECE Magazine Vol.21 Luffy ST29-001",
    dot: "ONE PIECE Magazine Vol.21 Luffy ST29-001",
    content: (
      <a
        className="sst-home-slide__link sst-opmag2-link"
        href={sourceHref(`/ko/products/one-piece-magazine-vol21-luffy-st29-001-yellow-promo-sealed`)}
        aria-label="자세히 보기: ONE PIECE Magazine Vol.21 Luffy ST29-001"
      >
        <BannerPicture
          className="sst-opmag2-picture"
          mq="(max-width: 749px)"
          mobile={src("/themes/samurai-sword/assets/home-banner-opmag2-mobile-20260910-v2.webp")}
          desktop={src("/themes/samurai-sword/assets/home-banner-opmag2-desktop-20260910-v2.webp")}
          w={3808}
          h={492}
          alt="ONE PIECE Magazine 루피 프로모 카드 예약 배너. 12월 발송."
        />
      </a>
    ),
  },
  {
    className: "sst-home-slide--psabo",
    label: "PSA 10 백오더",
    dot: "PSA 10 백오더",
    content: (
      <a
        className="sst-home-slide__link"
        href={sourceHref(`/ko/blogs/news/psa-10-back-orders`)}
        aria-label="PSA 10 백오더: 아직 재고가 없는 카드 — 저희가 대신 확보해 드립니다"
      >
        <div className="sst-home-slide__inner">
          <div className="sst-home-slide__copy sst-home-slide__copy--psabo">
            <span className="sst-home-slide__kicker">PSA 백오더</span>
            <h2>
              <span className="sst-home-psabo-title">PSA 10 백오더</span>
            </h2>
            <p>아직 재고가 없는 카드 — 저희가 대신 확보해 드립니다</p>
            <strong className="sst-home-slide__deal">백오더 카드 보기 →</strong>
          </div>
        </div>
      </a>
    ),
  },
  {
    className: "sst-home-slide--card-paylater",
    label: "카드 결제 또는 PayPal 나중에 결제",
    dot: "카드 결제 또는 나중에 결제 배너 보기",
    content: (
      <a
        className="sst-home-slide__link"
        href={sourceHref(`/ko/blogs/news/credit-card-payments-and-paypal-pay-later`)}
        aria-label="카드 결제 또는 PayPal 나중에 결제. Visa, Mastercard, AMEX, JCB 사용 가능."
      />
    ),
  },
  {
    className: "sst-home-slide--damaged-outlet",
    label: "손상 박스 아울렛 배너",
    dot: "손상 박스 아울렛 배너 보기",
    content: (
      <a
        className="sst-home-slide__link"
        href={sourceHref(`/ko?qo_tab=discounted#quick-order`)}
        aria-label="손상 박스 아울렛. 외관 손상이 있는 미개봉 박스를 할인가로 판매합니다."
      >
        <div className="sst-home-slide__inner">
          <div className="sst-home-slide__copy sst-home-slide__copy--damaged">
            <span className="sst-home-slide__kicker">OUTLET</span>
            <h2>
              <span className="sst-home-damaged-title">손상 박스</span>
              <br />
              <span className="sst-home-damaged-sub">안의 카드는 동일, 가격은 더 저렴하게.</span>
            </h2>
            <p>
              도쿄 창고의 미개봉 박스로, 외부 박스에 찌그러짐이나 긁힘이 있습니다. 슈링크는 온전하며 안의 카드에는 영향이 없습니다.
            </p>
            <ul className="sst-home-damaged-badges" aria-hidden="true">
              <li>밀봉 · 미개봉</li>
              <li>상태 사진 및 동영상</li>
              <li>현 상태 그대로 판매</li>
            </ul>
            <strong className="sst-home-slide__deal">손상 박스 보기 →</strong>
          </div>
        </div>
      </a>
    ),
  },
  {
    className: "sst-home-slide--current",
    label: "도쿄에서 발송되는 미개봉 일본 TCG",
    dot: "도쿄 발송 배너 표시",
    content: (
      <div className="sst-slim-hero__inner">
        <div className="sst-slim-hero__copy">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="sst-slim-hero__logo"
            src={src("/themes/samurai-sword/assets/samurai_sword.webp")}
            alt="Samurai Sword Tokyo"
            width={240}
            height={101}
          />
          <p className="sst-slim-hero__brand">Samurai Sword Tokyo</p>
          <h1>
            <span className="b">일본 정품 TCG 미개봉 상품.</span>
            <br />
            도쿄에서 발송.
          </h1>
        </div>
        <aside className="sst-slim-hero__account" aria-label="비회원 주문 가능">
          <strong className="sst-slim-hero__account-title">비회원 주문 가능</strong>
          <span className="sst-slim-hero__account-copy">
            회원 쿠폰은 결제 전에 가입하거나 로그인해야 사용할 수 있습니다. 결제 중 계정을 만들어도 해당 주문에서는 쿠폰이 활성화되지 않습니다.
          </span>
        </aside>
      </div>
    ),
  },
];

export function HomeSlider() {
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  // On touch devices the source CSS turns the track into a scroll-snap strip
  // (transform: none !important), so navigation scrolls instead.
  const isScrollMode = useCallback(() => {
    const track = trackRef.current;
    return !!track && getComputedStyle(track).scrollSnapType.startsWith("x");
  }, []);

  const go = useCallback(
    (index: number) => {
      const next = (index + SLIDES.length) % SLIDES.length;
      setActive(next);
      const track = trackRef.current;
      if (track && isScrollMode()) {
        const slide = track.children[next] as HTMLElement | undefined;
        track.scrollTo({ left: slide ? slide.offsetLeft - track.offsetLeft : 0, behavior: "smooth" });
      }
    },
    [isScrollMode],
  );

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const onScroll = () => {
      if (!isScrollMode()) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const first = track.children[0] as HTMLElement | undefined;
        const step = first ? first.offsetWidth + 8 : track.clientWidth;
        setActive(Math.max(0, Math.min(SLIDES.length - 1, Math.round(track.scrollLeft / step))));
      });
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener("scroll", onScroll);
    };
  }, [isScrollMode]);

  return (
    <section className="sst-home-slider" data-active={active} aria-label="홈페이지 배너">
      {/* Desktop position comes from the source CSS: [data-active="N"] .track { translateX(-N00%) }. */}
      <div className="sst-home-slider__track" ref={trackRef}>
        {SLIDES.map((s, i) => (
          <section
            key={s.className}
            className={`sst-home-slide ${s.className}`}
            aria-label={s.label}
            aria-hidden={i !== active || undefined}
          >
            {s.content}
          </section>
        ))}
      </div>
      <div className="sst-home-slider__dots" aria-label="홈페이지 배너 컨트롤">
        {SLIDES.map((s, i) => (
          <button
            key={s.className}
            type="button"
            className={i === active ? "is-active" : undefined}
            aria-pressed={i === active}
            aria-label={s.dot}
            onClick={() => go(i)}
          />
        ))}
      </div>
      <button type="button" className="sst-home-slider__arrow sst-home-slider__arrow--prev" aria-label="이전 배너" onClick={() => go(active - 1)}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
          <path d="M15 5l-7 7 7 7" />
        </svg>
      </button>
      <button type="button" className="sst-home-slider__arrow sst-home-slider__arrow--next" aria-label="다음 배너" onClick={() => go(active + 1)}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
          <path d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </section>
  );
}
