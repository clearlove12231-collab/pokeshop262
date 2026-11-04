"use client";

/* eslint-disable @next/next/no-img-element */
import { useStore } from "./store";

/**
 * The source header, reduced to the store logo and the cart button. Navigation,
 * search, socials, language, account, coupon and dark-mode controls are removed.
 */
export function SiteHeader() {
  const { cartCount, setCartOpen } = useStore();

  return (
    <header className="sst-header">
      <div className="sst-container sst-header__main">
        <a className="sst-brand" href="/ko?qo_tab=pokemon">
          <img src="/images/pokeshop-logo.webp" alt="PokeShop" width={256} height={256} />
        </a>
        <div className="sst-actions">
          {/* An <a> like the source, so the icon-link styles apply unchanged; it opens the drawer. */}
          <a
            className="sst-icon-link sst-cart-toggle"
            href="#sst-cart-drawer"
            role="button"
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
    </header>
  );
}
