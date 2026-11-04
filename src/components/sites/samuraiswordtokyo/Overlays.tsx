"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { LOGO, SHOP_NAME, TIKTOK_HANDLE, TIKTOK_URL } from "./brand";
import { formatWon, toWon } from "./price";
import { useStore } from "./store";
import type { CartLine } from "./types";

// Totals add up the rounded unit prices shown on the cards, so the numbers agree.
const unitWon = (line: CartLine) => line.priceWon ?? toWon(line.priceYen);

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"
      />
    </svg>
  );
}

/** Text the customer can paste into a TikTok DM. */
function orderSummary(cart: CartLine[], total: number): string {
  return [
    `[${SHOP_NAME} 주문 문의]`,
    ...cart.map((l) => `- ${l.name} × ${l.qty} = ${formatWon(unitWon(l) * l.qty)}`),
    `합계: ${formatWon(total)}`,
  ].join("\n");
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for browsers without clipboard permission.
    const area = document.createElement("textarea");
    area.value = text;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  }
}

/** Checkout step: orders are taken over TikTok DM. */
function OrderNotice({ cart, total, onClose }: { cart: CartLine[]; total: number; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <div className="shop-order" role="dialog" aria-modal="true" aria-labelledby="shop-order-title" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="shop-order__panel">
        <button type="button" className="shop-order__close" aria-label="닫기" onClick={onClose}>
          ×
        </button>
        <img className="shop-order__logo" src={LOGO} alt="" width={72} height={72} />
        <h2 className="shop-order__title" id="shop-order-title">
          주문 안내
        </h2>
        <p className="shop-order__lead">
          상품 주문 문의는 <b>TikTok DM</b>으로 부탁드립니다.
        </p>
        <p className="shop-order__sub">아래 주문 내용을 복사해서 DM으로 보내 주세요.</p>
        <ul className="shop-order__lines">
          {cart.map((l) => (
            <li key={l.variantId}>
              <span className="shop-order__name">
                {l.name} <span className="shop-order__qty">× {l.qty}</span>
              </span>
              <span className="shop-order__price">{formatWon(unitWon(l) * l.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="shop-order__total">
          <span>합계</span>
          <strong>{formatWon(total)}</strong>
        </div>
        <div className="shop-order__actions">
          <button
            type="button"
            className="shop-order__copy"
            onClick={async () => {
              setCopied(await copyText(orderSummary(cart, total)));
              window.setTimeout(() => setCopied(false), 2500);
            }}
          >
            {copied ? "복사됨 ✓" : "주문 내용 복사"}
          </button>
          <a className="shop-order__dm" href={TIKTOK_URL} target="_blank" rel="noopener">
            <TikTokIcon />
            TikTok DM으로 문의하기
          </a>
        </div>
        <p className="shop-order__handle">TikTok {TIKTOK_HANDLE}</p>
      </div>
    </div>,
    document.body,
  );
}

export function CartDrawer() {
  const { cart, cartOpen, setCartOpen, setQty, removeLine } = useStore();
  const [ordering, setOrdering] = useState(false);
  const wonTotal = cart.reduce((sum, line) => sum + unitWon(line) * line.qty, 0);

  useEffect(() => {
    if (!cartOpen || ordering) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setCartOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cartOpen, ordering, setCartOpen]);

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
                    <span className="sst-cart-drawer__line-total">{formatWon(unitWon(line) * line.qty)}</span>
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
              <strong>{formatWon(wonTotal)}</strong>
            </div>
          )}
          {cart.length > 0 ? (
            <button type="button" className="button shop-checkout" onClick={() => setOrdering(true)}>
              주문하기
            </button>
          ) : (
            <button type="button" className="button shop-checkout" onClick={() => setCartOpen(false)}>
              쇼핑 계속하기
            </button>
          )}
        </div>
      </div>
      <div className="sst-cart-drawer-overlay" onClick={() => setCartOpen(false)} />
      {ordering && cart.length > 0 && <OrderNotice cart={cart} total={wonTotal} onClose={() => setOrdering(false)} />}
    </>
  );
}

/** Floating "주문 문의" button: points customers to TikTok DM. */
export function OrderHelpChat() {
  const [open, setOpen] = useState(false);
  return (
    <div className="sst-order-help-chat" id="sst-order-help-chat" data-open={open ? "1" : "0"} data-position="bottom-right">
      <button className="sst-ohc-launcher" type="button" aria-label="주문 문의" aria-expanded={open} aria-controls="sst-ohc-panel" onClick={() => setOpen((o) => !o)}>
        <span className="sst-ohc-launcher__icon" aria-hidden="true" />
        <span className="sst-ohc-launcher__label">주문 문의</span>
      </button>
      <section className="sst-ohc-panel" id="sst-ohc-panel" role="dialog" aria-modal="false" aria-labelledby="sst-ohc-title" aria-hidden={!open} hidden={!open}>
        <div className="sst-ohc-header">
          <div className="sst-ohc-heading">
            <img className="sst-ohc-avatar shop-ohc-avatar" src={LOGO} alt="" width={36} height={36} />
            <div className="sst-ohc-heading__copy">
              <h2 className="sst-ohc-title" id="sst-ohc-title">
                주문 문의
              </h2>
              <p className="sst-ohc-subtitle">
                <span className="sst-ohc-status-dot" aria-hidden="true" />
                {SHOP_NAME}
              </p>
            </div>
          </div>
          <button className="sst-ohc-close" type="button" aria-label="닫기" onClick={() => setOpen(false)}>
            ×
          </button>
        </div>
        <div className="sst-ohc-body">
          <div className="sst-ohc-row sst-ohc-row--bot">
            <img className="sst-ohc-avatar shop-ohc-avatar" src={LOGO} alt="" width={28} height={28} />
            <div className="sst-ohc-message sst-ohc-message--intro">
              <h3 className="sst-ohc-message__title">안녕하세요!</h3>
              <p className="sst-ohc-message__text">상품 주문 문의는 TikTok DM으로 부탁드립니다.</p>
            </div>
          </div>
          <div className="sst-ohc-choices">
            <a className="sst-ohc-choice sst-ohc-choice--lookup" href={TIKTOK_URL} target="_blank" rel="noopener">
              <span className="sst-ohc-choice__label">TikTok DM으로 문의하기 ({TIKTOK_HANDLE})</span>
              <span className="sst-ohc-choice__arrow" aria-hidden="true">
                ›
              </span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
