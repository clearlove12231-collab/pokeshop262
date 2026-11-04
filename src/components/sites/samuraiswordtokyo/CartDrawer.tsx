"use client";

/* eslint-disable @next/next/no-img-element */
import "./cart-notice.css";
import { useEffect, useRef, useState } from "react";
import { formatWon } from "./price";
import { INQUIRY_URL } from "./shop";
import { useStore } from "./store";

/**
 * "결제하기" does not take payment: it opens this notice, which asks for
 * package purchase inquiries on TikTok and links there (new tab, so the cart stays open).
 */
function OrderNotice({ onClose }: { onClose: () => void }) {
  const goRef = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    goRef.current?.focus();
  }, []);
  return (
    <div className="sst-order-notice" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sst-order-notice__panel" role="dialog" aria-modal="true" aria-labelledby="sst-order-notice-title">
        <button type="button" className="sst-order-notice__close" aria-label="닫기" onClick={onClose}>
          ×
        </button>
        <strong id="sst-order-notice-title" className="sst-order-notice__title">
          구매 문의 안내
        </strong>
        <p className="sst-order-notice__text">
          상세 패키지 구매문의는{" "}
          <a className="sst-order-notice__url" href={INQUIRY_URL} target="_blank" rel="noopener noreferrer">
            {INQUIRY_URL}
          </a>{" "}
          으로 부탁드립니다.
        </p>
        <a ref={goRef} className="button sst-order-notice__go" href={INQUIRY_URL} target="_blank" rel="noopener noreferrer">
          TikTok으로 이동하기
        </a>
      </div>
    </div>
  );
}

/** Slide-in cart (body.sst-cart-open), same markup as the source drawer. */
export function CartDrawer() {
  const { cart, cartTotal, cartOpen, setCartOpen, setQty, removeLine } = useStore();
  const [noticeOpen, setNoticeOpen] = useState(false);

  useEffect(() => {
    if (!cartOpen && !noticeOpen) return;
    // Esc closes the top layer first: the notice, then the drawer.
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (noticeOpen) setNoticeOpen(false);
      else setCartOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cartOpen, noticeOpen, setCartOpen]);

  return (
    <>
      <div className="sst-cart-drawer" id="sst-cart-drawer" aria-hidden={!cartOpen} inert={!cartOpen} role="dialog" aria-label="장바구니">
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
                    <span className="sst-cart-drawer__line-total">{formatWon(line.priceWon * line.qty)}</span>
                    <button type="button" className="sst-cart-drawer__remove" onClick={() => removeLine(line.variantId)}>
                      삭제
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {cart.length > 0 && (
          <div className="sst-cart-drawer__foot">
            <div className="sst-cart-drawer__estimate-line">
              <span>상품 소계</span>
              <strong>{formatWon(cartTotal)}</strong>
            </div>
            {/* The source's filled checkout button (`.button.alt`); here it opens the inquiry notice. */}
            <button type="button" className="button checkout wc-forward alt" onClick={() => setNoticeOpen(true)}>
              결제하기
            </button>
          </div>
        )}
      </div>
      <div className="sst-cart-drawer-overlay" onClick={() => setCartOpen(false)} />
      {noticeOpen && <OrderNotice onClose={() => setNoticeOpen(false)} />}
    </>
  );
}
