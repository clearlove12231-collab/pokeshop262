"use client";

/* eslint-disable @next/next/no-img-element */
import { useState, type CSSProperties } from "react";
import { sourceHref } from "../paths";
import { CURRENCY_SYMBOL, formatAmount, yenFromText } from "../price";
import { useStore } from "../store";
import type { Offer, Product } from "../types";

/** Rating stars fill per star, floored to the nearest quarter like the source. */
function starFills(avg: number): string[] {
  return Array.from({ length: 5 }, (_, i) => {
    const part = Math.max(0, Math.min(1, avg - i));
    return `${Math.floor(part * 4) * 25}%`;
  });
}

/** Price in the source's WooCommerce markup, shown in KRW (see price.ts). */
function PriceAmount({ yen, bdi }: { yen: number; bdi?: boolean }) {
  const inner = (
    <>
      <span className="woocommerce-Price-currencySymbol" translate="no" dir="auto">
        {CURRENCY_SYMBOL}
      </span>
      {formatAmount(yen)}
    </>
  );
  return <span className="woocommerce-Price-amount amount">{bdi ? <bdi>{inner}</bdi> : inner}</span>;
}

function Badges({ product }: { product: Product }) {
  if (product.preorder) {
    return (
      <span className="sst-qo__badges">
        <span className="sst-qo__badge sst-qo__badge--pre">예약 주문 · 발송 예정일 {product.releaseText}</span>
      </span>
    );
  }
  const inStock = product.offers.some((o) => o.stockState === "in");
  return (
    <span className="sst-qo__badges">
      {product.sale && <span className="sst-qo__badge sst-qo__badge--sale">세일</span>}
      {product.hot && <span className="sst-qo__badge sst-qo__badge--hot">인기</span>}
      {inStock ? (
        <span className="sst-qo__badge sst-qo__badge--in">재고 있음</span>
      ) : (
        <span className="sst-qo__badge sst-qo__badge--out">품절</span>
      )}
    </span>
  );
}

function OfferCell({ product, offer }: { product: Product; offer: Offer }) {
  const { qtyFor, setQty } = useStore();
  const [notify, setNotify] = useState(false);
  const qty = qtyFor(offer.variantId);
  const name = offer.cartName ?? product.name;
  const line = {
    variantId: offer.variantId,
    handle: product.handle,
    name,
    img: product.img.src,
    priceYen: offer.priceYen,
    max: offer.max,
  };
  const preorder = product.preorder;
  const sale = offer.classes.includes("sst-qo__offer--sale");
  const tdClass = ["sst-qo__offer", ...offer.classes, preorder ? "sst-qo__offer--preorder" : ""].filter(Boolean).join(" ");
  const cardClass = [
    "sst-qo__offer-cell sst-qo__offer-card",
    `sst-qo__offer-cell--${offer.type}`,
    preorder ? "sst-qo__offer-card--preorder" : "",
    sale ? "sst-qo__offer-card--sale" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const noshrink = offer.type === "noshrink";

  let action;
  if (offer.action === "quote") {
    action = <span className="sst-qo__not-sold">This item is currently not sold on this site.</span>;
  } else if (offer.stockState === "out") {
    action = (
      <button
        type="button"
        className="sst-rsn-btn"
        aria-pressed={notify}
        title="Email me when this item is back in stock"
        onClick={() => setNotify((n) => !n)}
      >
        <svg viewBox="0 0 20 20" width="13" height="13" aria-hidden="true" focusable="false">
          <path fill="currentColor" d="M10 2a1 1 0 0 1 1 1v.6a4.6 4.6 0 0 1 3.6 4.49v2.6l1.2 2.05a.8.8 0 0 1-.69 1.2H4.89a.8.8 0 0 1-.69-1.2L5.4 10.7V8.09A4.6 4.6 0 0 1 9 3.6V3a1 1 0 0 1 1-1Zm2 13.2a2 2 0 0 1-4 0h4Z" />
        </svg>
        <span className="sst-rsn-btn__label">Notify</span>
      </button>
    );
  } else if (offer.action === "quantity") {
    action = (
      <div className="sst-qo__qty" data-sst-qty-state={qty > 0 ? "set" : "zero"}>
        <button type="button" data-act="-" aria-label={`감소: ${name}`} onClick={() => setQty(line, qty - 1)}>
          -
        </button>
        <input
          type="number"
          data-handle={product.handle}
          data-qo-action-state={offer.action}
          data-qo-sale={sale ? 1 : 0}
          min={0}
          max={offer.max}
          value={qty}
          inputMode="numeric"
          enterKeyHint="done"
          autoComplete="off"
          aria-label={`Quantity: ${name}`}
          onChange={(e) => setQty(line, Number(e.target.value))}
          onFocus={(e) => e.currentTarget.select()}
        />
        <button type="button" data-act="+" aria-label={`증가: ${name}`} onClick={() => setQty(line, qty + 1)}>
          +
        </button>
      </div>
    );
  } else {
    action = <span className="sst-qo__offer-action-empty" aria-hidden="true" />;
  }

  return (
    <td
      className={tdClass}
      colSpan={offer.colSpan}
      data-stock-state={offer.stockState}
      data-qo-offer-type={offer.type}
      data-qo-price-state="priced"
      data-qo-stock-state={offer.stockState}
      data-qo-action-state={offer.action}
      data-qo-max-qty={offer.max}
      data-qo-sale={sale ? 1 : 0}
      data-qo-backorder={0}
    >
      <div className={cardClass} data-qo-action-state={offer.action} data-qo-sale={sale ? 1 : 0}>
        <div className="sst-qo__offer-info">
          <span
            className="sst-qo__offer-label"
            {...(noshrink ? { role: "note", title: "NO SHRINK란?", "aria-label": "NO SHRINK란?" } : {})}
          >
            {offer.label}
          </span>
          <span className={`sst-qo__offer-stock sst-qo__stock--${offer.stockState}`}>{offer.stockText}</span>
          {offer.action === "quote" ? (
            <span className="sst-qo__offer-price sst-qo__offer-price--empty" aria-hidden="true">
              &nbsp;
            </span>
          ) : sale && offer.saleRegular && offer.saleCurrent ? (
            <span className="sst-qo__offer-price sst-qo__offer-price--sale">
              <span className="sst-qo__sale-prices">
                <del className="sst-qo__sale-regular">
                  <PriceAmount yen={yenFromText(offer.saleRegular)} bdi />
                </del>
                <ins className="sst-qo__sale-current">
                  <PriceAmount yen={yenFromText(offer.saleCurrent)} bdi />
                </ins>
              </span>
            </span>
          ) : (
            <span className="sst-qo__offer-price">{offer.price && <PriceAmount yen={offer.priceYen} />}</span>
          )}
        </div>
        <div className="sst-qo__offer-action">{action}</div>
      </div>
    </td>
  );
}

export function ProductRow({ product }: { product: Product }) {
  const { favorites, toggleFavorite } = useStore();
  const fav = favorites.includes(product.handle);
  const [pop, setPop] = useState(false);
  const { img } = product;
  const avg = product.rating ? Number(product.rating.avg) : 0;

  return (
    <tr
      className={product.rowClass}
      data-handle={product.handle}
      data-group={product.group}
      data-qo-row-key={product.key}
      data-qo-group={product.group}
      data-qo-family="pokemon"
      data-qo-subgroup={product.subgroup}
      data-qo-offer-count={product.offers.length}
      data-qo-single-offer={product.offers.length === 1 ? 1 : 0}
      data-qo-price-yen={product.priceYen}
      data-qo-stock-total={product.stockTotal}
      data-qo-handle={product.handle}
      data-qo-media-variant={img.variant}
      data-qo-hot={product.hot ? 1 : 0}
      data-qo-sale={product.sale ? 1 : 0}
      data-qo-flash={product.flash ? 1 : undefined}
      data-qo-preorder={product.preorder ? 1 : 0}
      data-sst-rarity={product.rarity}
      data-sst-psa-pin={product.pinned ? 1 : undefined}
      data-sst-rs={product.rating ? 1 : undefined}
    >
      <td className="sst-qof-cell">
        <a className="sst-qo__prod" href={sourceHref(product.url)}>
          <img
            src={img.src}
            srcSet={img.srcSet}
            sizes={img.sizes}
            alt={img.alt}
            className={`sst-qo__img sst-qo__media sst-qo__media--${img.variant}`}
            width={img.width}
            height={img.height}
            loading="lazy"
            decoding="async"
          />
          <span className="sst-qo__prod-copy">
            <Badges product={product} />
            <span className="sst-qo__pname">{product.name}</span>
            {product.rating && (
              <span className="sst-rs sst-rs--qo sst-rs-qo">
                <span className="sst-rs-stars" role="img" aria-label={`${product.rating.avg} / 5`}>
                  {starFills(avg).map((f, i) => (
                    <i key={i} className="sst-rs-star" style={{ "--f": f } as CSSProperties} />
                  ))}
                </span>
                <span className="sst-rs__avg">{product.rating.avg}</span>
                <span className="sst-rs__count">({product.rating.count})</span>
              </span>
            )}
            {product.jan && <span className="sst-qo__jan">{product.jan}</span>}
          </span>
        </a>
        <button
          className={`sst-qof-star${pop ? " is-pop" : ""}`}
          type="button"
          aria-pressed={fav}
          aria-label={fav ? "관심 목록에서 삭제" : "관심 목록에 추가"}
          title={fav ? "관심 목록에서 삭제" : "관심 목록에 추가"}
          onClick={() => {
            toggleFavorite(product.handle);
            setPop(true);
            window.setTimeout(() => setPop(false), 400);
          }}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M12 2.8l2.8 6 6.6.8-4.9 4.5 1.3 6.5L12 17.4 6.2 20.6l1.3-6.5L2.6 9.6l6.6-.8z" />
          </svg>
        </button>
      </td>
      {product.offers.map((o) => (
        <OfferCell key={o.variantId || o.type} product={product} offer={o} />
      ))}
    </tr>
  );
}
