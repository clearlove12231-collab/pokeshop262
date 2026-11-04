"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "./price";
import { useStore } from "./store";
import { sourceHref, src } from "./paths";

const NAV = [
  { label: "쇼핑", href: "/ko?qo_tab=pokemon" },
  { label: "뉴스", href: sourceHref(`/ko/blogs/news`) },
  { label: "TCG Index", href: sourceHref(`/ko/tcg-index`) },
  { label: "카드 리스트", href: sourceHref(`/ko/pages/card-list`) },
  { label: "소개", href: sourceHref(`/ko/pages/about`) },
  { label: "문의", href: sourceHref(`/ko/pages/contact`) },
  { label: "FAQ", href: sourceHref(`/ko/faq`), className: "sst-faq-link" },
];

const LANGUAGES = [
  { label: "English", href: sourceHref(`/`), lang: "en-US", hrefLang: "en" },
  { label: "Español", href: sourceHref(`/es`), lang: "es", hrefLang: "es" },
  { label: "Deutsch", href: sourceHref(`/de`), lang: "de", hrefLang: "de" },
  { label: "Français", href: sourceHref(`/fr`), lang: "fr", hrefLang: "fr" },
  { label: "简体中文", href: sourceHref(`/zh-hans`), lang: "zh-Hans", hrefLang: "zh-Hans" },
  { label: "繁體中文", href: sourceHref(`/zh-hant`), lang: "zh-Hant", hrefLang: "zh-Hant" },
  { label: "Italiano", href: sourceHref(`/it`), lang: "it", hrefLang: "it" },
  { label: "Nederlands", href: sourceHref(`/nl`), lang: "nl", hrefLang: "nl" },
  { label: "Bahasa Indonesia", href: sourceHref(`/id`), lang: "id", hrefLang: "id" },
  { label: "한국어", href: "/ko?qo_tab=pokemon", lang: "ko", hrefLang: "ko", active: true },
];

const COUPON_GOAL = 30000;

function SearchIcon() {
  return (
    <svg focusable="false" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.4 15.4L20.5 20.5" />
    </svg>
  );
}

function ThemeIcons() {
  return (
    <>
      <svg className="sst-theme-toggle__icon sst-theme-toggle__moon" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.5 13.3A8.4 8.4 0 0 1 10.7 3.5a8.4 8.4 0 1 0 9.8 9.8Z" />
      </svg>
      <svg className="sst-theme-toggle__icon sst-theme-toggle__sun" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2.6v2.1M12 19.3v2.1M4.4 4.4l1.5 1.5M18.1 18.1l1.5 1.5M2.6 12h2.1M19.3 12h2.1M4.4 19.6l1.5-1.5M18.1 5.9l1.5-1.5" />
      </svg>
    </>
  );
}

function useTheme(): [boolean, () => void] {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    // The inline script in the root layout applies the stored theme before paint.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDark(document.documentElement.getAttribute("data-sst-theme") === "dark");
  }, []);
  const toggle = () => {
    const next = !dark;
    setDark(next);
    if (next) document.documentElement.setAttribute("data-sst-theme", "dark");
    else document.documentElement.removeAttribute("data-sst-theme");
    try {
      window.localStorage.setItem("sst-theme", next ? "dark" : "light");
    } catch {
      // ignore
    }
  };
  return [dark, toggle];
}

/** Focus the quick-order search: this clone has no site-wide search overlay. */
function openSearch() {
  const input = document.querySelector<HTMLInputElement>(
    "#quick-order .sst-qo__toolbar:not([hidden]) .sst-qo__search",
  );
  document.getElementById("quick-order")?.scrollIntoView({ behavior: "smooth", block: "start" });
  window.setTimeout(() => input?.focus({ preventScroll: true }), 350);
}

export function SiteHeader() {
  const { cartCount, cartTotal, setCartOpen, favorites } = useStore();
  const [dark, toggleTheme] = useTheme();
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("sst-nav-open", navOpen);
  }, [navOpen]);

  const themeLabel = dark ? "라이트 모드로 전환" : "다크 모드로 전환";
  const progress = Math.min(100, (cartTotal / COUPON_GOAL) * 100);

  return (
    <header className="sst-header">
      <div className="sst-container sst-header__main">
        <button
          className="sst-menu-toggle"
          type="button"
          aria-label={navOpen ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={navOpen}
          aria-controls="sst-primary-nav"
          onClick={() => setNavOpen((o) => !o)}
        >
          <span className="sst-menu-toggle__icons">
            <svg className="sst-icon-hamburger" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="5" y1="7" x2="19" y2="7" />
              <line x1="5" y1="12" x2="19" y2="12" />
              <line x1="5" y1="17" x2="19" y2="17" />
            </svg>
            <svg className="sst-icon-close" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="6" y1="18" x2="18" y2="6" />
            </svg>
          </span>
        </button>
        <a className="sst-brand" href="/ko?qo_tab=pokemon">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={dark ? src("/themes/samurai-sword/assets/samurai_sword-dark.webp") : src("/themes/samurai-sword/assets/samurai_sword.webp")}
            alt="Samurai Sword Tokyo"
            width={480}
            height={201}
          />
        </a>
        <nav className="sst-header-links" aria-label="헤더 내비게이션">
          <ul className="sst-header-links__list">
            <li className="sst-ss-item">
              <button className="sst-ss-toggle sst-ss-toggle--nav" type="button" aria-label="검색" title="검색" onClick={openSearch}>
                <SearchIcon />
              </button>
            </li>
            {NAV.map((item) => (
              <li key={item.label} className={`menu-item ${item.className ?? ""}`.trim()}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
            <li className="sst-theme-toggle-item">
              <button type="button" className="sst-theme-toggle sst-theme-toggle--nav" aria-label={themeLabel} aria-pressed={dark} onClick={toggleTheme}>
                <ThemeIcons />
                <span className="sst-theme-toggle__label">{dark ? "라이트" : "다크"}</span>
              </button>
            </li>
          </ul>
        </nav>
        <div className="sst-actions">
          <div className="sst-header-social">
            <a className="sst-header-social__link" href="https://www.instagram.com/samurai_sword_tokyo_jp/" target="_blank" rel="noopener" aria-label="Instagram">
              <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
            <a className="sst-header-social__link" href="https://www.tiktok.com/@samuraisword.tokyo" target="_blank" rel="noopener" aria-label="TikTok">
              <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
              </svg>
            </a>
            <a className="sst-header-social__link" href="https://x.com/samurai_swordjp" target="_blank" rel="noopener" aria-label="X (Twitter)">
              <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>
          <div className="sst-header__language">
            <details className="sst-language-switcher">
              <summary className="sst-language-switcher__summary">
                <span>한국어</span>
              </summary>
              <div className="sst-language-switcher__menu">
                {LANGUAGES.map((l) => (
                  <a
                    key={l.label}
                    className={`sst-language-switcher__item${l.active ? " is-active" : ""}`}
                    href={l.href}
                    hrefLang={l.hrefLang}
                    lang={l.lang}
                  >
                    {l.label}
                  </a>
                ))}
              </div>
            </details>
          </div>
          <div className="sst-coupon-popover-wrap">
            <a className="sst-icon-link sst-icon-link--coupons" href={sourceHref(`/ko/my-account/customer-coupons`)} aria-label="쿠폰">
              <svg focusable="false" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8Z" />
                <path d="M9 9h6" />
                <path d="M9 15h6" />
              </svg>
              <span>쿠폰</span>
              <span className="sst-coupon-count" />
            </a>
          </div>
          <a className="sst-icon-link sst-icon-link--calendar" href={sourceHref(`/ko/?qo_tab=pokemon#sst-calendar`)} aria-label="캘린더">
            <svg focusable="false" viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
              <path d="M3.5 10h17" />
              <path d="M8 3v4" />
              <path d="M16 3v4" />
              <path d="M8 14h2" />
              <path d="M14 14h2" />
              <path d="M8 17.5h2" />
            </svg>
            <span>캘린더</span>
          </a>
          <a className="sst-icon-link sst-icon-link--orders" href={sourceHref(`/ko/orders`)} aria-label="주문">
            <svg focusable="false" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7 3h10a2 2 0 0 1 2 2v16l-3-2-2 2-2-2-2 2-2-2-3 2V5a2 2 0 0 1 2-2Z" />
              <path d="M9 8h6" />
              <path d="M9 12h6" />
              <path d="M9 16h4" />
            </svg>
            <span>주문</span>
          </a>
          <a className="sst-icon-link sst-icon-link--watchlist" href={sourceHref(`/ko/watchlist`)} aria-label="관심 목록">
            <svg focusable="false" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 3.2l2.6 5.5 6 .7-4.5 4.1 1.2 6L12 16.6l-5.3 2.9 1.2-6-4.5-4.1 6-.7z" />
            </svg>
            <span>관심 목록</span>
            <em className="sst-wl-badge" hidden={favorites.length === 0}>
              {favorites.length}
            </em>
          </a>
          <a className="sst-icon-link sst-icon-link--account" href={sourceHref(`/ko/my-account`)} aria-label="계정">
            <svg focusable="false" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21a8 8 0 0 1 16 0" />
            </svg>
            <span>계정</span>
          </a>
          <button className="sst-ss-toggle sst-ss-toggle--mobile" type="button" aria-label="검색" title="검색" onClick={openSearch}>
            <SearchIcon />
          </button>
          <a
            className="sst-icon-link sst-cart-toggle"
            href={sourceHref(`/ko/cart`)}
            aria-label="장바구니"
            onClick={(e) => {
              e.preventDefault();
              setCartOpen(true);
            }}
          >
            <svg focusable="false" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 7h12l-1 14H7L6 7Z" />
              <path d="M9 7a3 3 0 0 1 6 0" />
            </svg>
            <span>장바구니</span>
            <span className="sst-cart-count">{cartCount > 0 ? cartCount : ""}</span>
          </a>
          <div className="sst-cb sst-cb--header">
            <div className="sst-cb__txt">
              <span className="sst-cb-long">
                Spend <b>{formatPrice(30000)}</b> to unlock a <b>{formatPrice(2000)} off</b> coupon
              </span>
              <span className="sst-cb-short">
                <b>{formatPrice(2000)} off</b> from {formatPrice(30000)}
              </span>
            </div>
            <div className="sst-cb__track">
              <i style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </div>
      <div className="sst-nav-wrap" id="sst-primary-nav">
        <nav className="sst-container sst-nav" aria-label="기본 내비게이션">
          <ul className="sst-nav__list">
            {NAV.map((item) => (
              <li key={item.label} className={`menu-item ${item.className ?? ""}`.trim()}>
                <a href={item.href} onClick={() => setNavOpen(false)}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <ul className="sst-nav__qo-help">
          <li>
            <a className="sst-nav__qo-help-item" href={sourceHref(`/ko/faq`)}>
              주문 방법
            </a>
          </li>
          <li>
            <a className="sst-nav__qo-help-item" href={sourceHref(`/ko/faq`)}>
              NO SHRINK란?
            </a>
          </li>
        </ul>
        <div className="sst-nav__language">
          <p className="sst-nav__language-title">한국어</p>
          <ul className="sst-nav__language-list">
            {LANGUAGES.filter((l) => !l.active).map((l) => (
              <li key={l.label}>
                <a className="sst-nav__language-item" href={l.href} hrefLang={l.hrefLang} lang={l.lang}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="sst-nav__utility" aria-label="소셜 링크">
          <a href="https://pinterest.com/SamuraiSwordTokyo/" target="_blank" rel="noopener">Pinterest</a>
          <a href="https://www.instagram.com/samurai_sword_tokyo_jp/" target="_blank" rel="noopener">Instagram</a>
          <a href="https://www.tiktok.com/@samuraisword.tokyo" target="_blank" rel="noopener">TikTok</a>
          <a href="https://x.com/samurai_swordjp" target="_blank" rel="noopener">X (Twitter)</a>
        </div>
        <div className="sst-nav__theme">
          <button type="button" className="sst-theme-toggle sst-theme-toggle--drawer" aria-pressed={dark} aria-label={themeLabel} onClick={toggleTheme}>
            <ThemeIcons />
            <span className="sst-theme-toggle__label">{dark ? "라이트" : "다크"}</span>
          </button>
        </div>
      </div>
      <div className="sst-nav-overlay" aria-hidden="true" onClick={() => setNavOpen(false)} />
    </header>
  );
}
