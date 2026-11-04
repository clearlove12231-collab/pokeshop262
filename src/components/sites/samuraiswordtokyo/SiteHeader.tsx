"use client";

import { useEffect, useState } from "react";
import { LOGO, SHOP_NAME, TIKTOK_URL } from "./brand";
import { useStore } from "./store";

const NAV: { label: string; href: string; external?: boolean }[] = [
  { label: "쇼핑", href: "/ko?qo_tab=pokemon" },
  { label: "주문 문의", href: TIKTOK_URL, external: true },
];

const externalProps = (external?: boolean) => (external ? { target: "_blank", rel: "noopener" } : {});

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
  const { cartCount, setCartOpen } = useStore();
  const [dark, toggleTheme] = useTheme();
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("sst-nav-open", navOpen);
  }, [navOpen]);

  const themeLabel = dark ? "라이트 모드로 전환" : "다크 모드로 전환";

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
        <a className="sst-brand shop-brand" href="/ko?qo_tab=pokemon">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO} alt={SHOP_NAME} width={1080} height={1080} />
        </a>
        <nav className="sst-header-links" aria-label="헤더 내비게이션">
          <ul className="sst-header-links__list">
            <li className="sst-ss-item">
              <button className="sst-ss-toggle sst-ss-toggle--nav" type="button" aria-label="검색" title="검색" onClick={openSearch}>
                <SearchIcon />
              </button>
            </li>
            {NAV.map((item) => (
              <li key={item.label} className="menu-item">
                <a href={item.href} {...externalProps(item.external)}>
                  {item.label}
                </a>
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
            <a className="sst-header-social__link" href={TIKTOK_URL} target="_blank" rel="noopener" aria-label="TikTok">
              <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
              </svg>
            </a>
          </div>
          <button className="sst-ss-toggle sst-ss-toggle--mobile" type="button" aria-label="검색" title="검색" onClick={openSearch}>
            <SearchIcon />
          </button>
          <a
            className="sst-icon-link sst-cart-toggle"
            href="#"
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
        </div>
      </div>
      <div className="sst-nav-wrap" id="sst-primary-nav">
        <nav className="sst-container sst-nav" aria-label="기본 내비게이션">
          <ul className="sst-nav__list">
            {NAV.map((item) => (
              <li key={item.label} className="menu-item">
                <a href={item.href} {...externalProps(item.external)} onClick={() => setNavOpen(false)}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="sst-nav__utility" aria-label="소셜 링크">
          <a href={TIKTOK_URL} target="_blank" rel="noopener">
            TikTok
          </a>
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
