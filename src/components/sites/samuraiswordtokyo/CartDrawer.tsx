"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect } from "react";
import { formatWon } from "./price";
import { useStore } from "./store";

/**
 * Slide-in cart (body.sst-cart-open), same markup as the source drawer.
 * Checkout belongs to the source store and is not part of the clone, so the
 * footer shows the subtotal only.
 */
export function CartDrawer() {
  const { cart, cartTotal, cartOpen, setCartOpen, setQty, removeLine } = useStore();

  useEffect(() => {
    if (!cartOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setCartOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cartOpen, setCartOpen]);

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
          </div>
        )}
      </div>
      <div className="sst-cart-drawer-overlay" onClick={() => setCartOpen(false)} />
    </>
  );
}
