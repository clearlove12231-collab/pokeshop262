"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { useStore, yen } from "./store";
import { sourceHref, src } from "./paths";

export function CartDrawer() {
  const { cart, cartOpen, setCartOpen, setQty, removeLine, cartTotal } = useStore();

  useEffect(() => {
    if (!cartOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setCartOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cartOpen, setCartOpen]);

  return (
    <>
      <div className="sst-cart-drawer" id="sst-cart-drawer" aria-hidden={!cartOpen} role="dialog" aria-label="장바구니">
        <div className="sst-cart-drawer__head">
          <strong>장바구니</strong>
          <button className="sst-cart-drawer__close" type="button" aria-label="장바구니 닫기" onClick={() => setCartOpen(false)}>
            ×
          </button>
        </div>
        <div className="sst-cart-drawer__body">
          {cart.length === 0 ? (
            <p className="sst-cart-drawer__empty">장바구니가 비어 있습니다.</p>
          ) : (
            <ul className="sst-cart-drawer__items">
              {cart.map((line) => (
                <li key={line.variantId} className="sst-cart-drawer__item">
                  <img className="sst-cart-drawer__thumb" src={line.img} alt="" width={62} height={62} />
                  <div className="sst-cart-drawer__meta">
                    <span className="sst-cart-drawer__name">{line.name}</span>
                    <div className="sst-cart-drawer__qty-control">
                      <button type="button" className="sst-cart-drawer__qty-step" aria-label="감소" onClick={() => setQty(line, line.qty - 1)}>
                        −
                      </button>
                      <input
                        className="sst-cart-drawer__qty-input"
                        type="number"
                        min={0}
                        max={line.max}
                        value={line.qty}
                        aria-label={`Quantity: ${line.name}`}
                        onChange={(e) => setQty(line, Number(e.target.value))}
                      />
                      <button type="button" className="sst-cart-drawer__qty-step" aria-label="증가" onClick={() => setQty(line, line.qty + 1)}>
                        +
                      </button>
                    </div>
                    <span className="sst-cart-drawer__line-total">{yen(line.qty * line.priceYen)}</span>
                    <button type="button" className="sst-cart-drawer__remove" onClick={() => removeLine(line.variantId)}>
                      삭제
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className={`sst-cart-drawer__foot${cart.length === 0 ? " is-empty" : ""}`}>
          {cart.length > 0 && (
            <div className="sst-cart-drawer__estimate-line">
              <span>상품 소계</span>
              <strong>{yen(cartTotal)}</strong>
            </div>
          )}
          {/* Checkout lives on the source store; this local cart is not transferred. */}
          <a className="button" href={sourceHref(`/ko/cart`)}>
            장바구니 보기
          </a>
        </div>
      </div>
      <div className="sst-cart-drawer-overlay" onClick={() => setCartOpen(false)} />
    </>
  );
}

const PROMO_KEY = "sst-clone-promo-closed";

export function PromoPop() {
  const [visible, setVisible] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    let closed = false;
    try {
      closed = window.sessionStorage.getItem(PROMO_KEY) === "1";
    } catch {
      // ignore
    }
    // Shown after mount, like the source script that un-hides it.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!closed) setVisible(true);
  }, []);

  const close = () => {
    setVisible(false);
    try {
      window.sessionStorage.setItem(PROMO_KEY, "1");
    } catch {
      // ignore
    }
  };

  return (
    <aside className="sstsm-promo-pop" id="sstsm-promo-pop" aria-label="Samurai Month daily free gacha" hidden={!visible}>
      <button
        className="sstsm-promo-close"
        type="button"
        aria-label="Close Samurai Month promotion"
        aria-haspopup="dialog"
        aria-controls="sstsm-promo-confirm"
        aria-expanded={confirming}
        onClick={() => setConfirming(true)}
      >
        ×
      </button>
      <div className="sstsm-promo-confirm" id="sstsm-promo-confirm" role="dialog" aria-modal="false" aria-labelledby="sstsm-promo-confirm-title" hidden={!confirming}>
        <p id="sstsm-promo-confirm-title">Close this popup?</p>
        <div className="sstsm-promo-confirm-actions">
          <button type="button" onClick={() => setConfirming(false)}>
            취소
          </button>
          <button type="button" onClick={close}>
            닫기
          </button>
        </div>
      </div>
      <a href={sourceHref(`/ko/blogs/news/samurai-month-2026#gacha`)} aria-label="Open Samurai Gacha — one free spin per day after login">
        <small>DAILY FREE GACHA</small>
        <span className="sstsm-promo-machine" aria-hidden="true">
          <img src={src("/plugins/sst-samurai-month/assets/gacha_machine_sp.webp")} alt="" width={768} height={768} />
          <span className="sstsm-promo-capsule" />
        </span>
        <span className="sstsm-promo-pop-cta">
          Open gacha <span aria-hidden="true">→</span>
        </span>
      </a>
    </aside>
  );
}

const HELP_TOPICS: [string, string][] = [
  ["Check my order status", "/ko/orders"],
  ["Was my order placed? / When will it arrive?", "/ko/faq"],
  ["Payment / cards / Wise", "/ko/pages/payment-methods"],
  ["Cancel my order", "/ko/faq"],
  ["Stock / sold out / ASK price", "/ko/faq"],
  ["Bulk / case orders", "/ko/faq"],
  ["Shipping / address / tracking", "/ko/policies/shipping-policy"],
  ["Shipping within Japan / pickup", "/ko/policies/shipping-policy"],
  ["Customs / import taxes", "/ko/pages/customs-duties-and-import-taxes"],
  ["Confirmation email", "/ko/faq"],
  ["Damaged / missing / wrong item", "/ko/pages/return-and-refund-policy"],
  ["Policies / terms", "/ko/policies/terms-of-service"],
];

export function OrderHelpChat() {
  const [open, setOpen] = useState(false);
  return (
    <div className="sst-order-help-chat" id="sst-order-help-chat" data-open={open ? "1" : "0"} data-position="bottom-right">
      <button className="sst-ohc-launcher" type="button" aria-label="Order help" aria-expanded={open} aria-controls="sst-ohc-panel" onClick={() => setOpen((o) => !o)}>
        <span className="sst-ohc-launcher__icon" aria-hidden="true" />
        <span className="sst-ohc-launcher__label">Order help</span>
      </button>
      <section className="sst-ohc-panel" id="sst-ohc-panel" role="dialog" aria-modal="false" aria-labelledby="sst-ohc-title" aria-hidden={!open} hidden={!open}>
        <div className="sst-ohc-header">
          <div className="sst-ohc-heading">
            <span className="sst-ohc-avatar" aria-hidden="true">
              S
            </span>
            <div className="sst-ohc-heading__copy">
              <h2 className="sst-ohc-title" id="sst-ohc-title">
                Order Help
              </h2>
              <p className="sst-ohc-subtitle">
                <span className="sst-ohc-status-dot" aria-hidden="true" />
                SAMURAI SWORD TOKYO Support
              </p>
            </div>
          </div>
          <button className="sst-ohc-close" type="button" aria-label="Close" onClick={() => setOpen(false)}>
            ×
          </button>
        </div>
        <div className="sst-ohc-body">
          <div className="sst-ohc-row sst-ohc-row--bot">
            <span className="sst-ohc-avatar" aria-hidden="true">
              S
            </span>
            <div className="sst-ohc-message sst-ohc-message--intro">
              <h3 className="sst-ohc-message__title">Hi there! How can we help?</h3>
              <p className="sst-ohc-message__text">Pick the topic closest to your question and we&apos;ll take you straight to the right place.</p>
            </div>
          </div>
          <div className="sst-ohc-choices">
            {HELP_TOPICS.map(([label, path], i) => (
              <a key={label} className={`sst-ohc-choice${i === 0 ? " sst-ohc-choice--lookup" : ""}`} href={sourceHref(`${path}`)}>
                <span className="sst-ohc-choice__label">{label}</span>
                <span className="sst-ohc-choice__arrow" aria-hidden="true">
                  ›
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
