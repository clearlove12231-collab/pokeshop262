"use client";

/* eslint-disable @next/next/no-img-element */
import { CURRENCY_SYMBOL, formatAmount, offerPrice, type OfferPrice as Price } from "../price";
import { RsStars } from "../stars";
import { useStore } from "../store";
import type { Offer, Product } from "../types";

/** Price in the source's WooCommerce markup, shown in KRW (see price.ts). */
function PriceAmount({ won, bdi }: { won: number; bdi?: boolean }) {
  const inner = (
    <>
      <span className="woocommerce-Price-currencySymbol" translate="no" dir="auto">
        {CURRENCY_SYMBOL}
      </span>
      {formatAmount(won)}
    </>
  );
  return <span className="woocommerce-Price-amount amount">{bdi ? <bdi>{inner}</bdi> : inner}</span>;
}

function Badges({ product, onSale }: { product: Product; onSale: boolean }) {
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
      {onSale && <span className="sst-qo__badge sst-qo__badge--sale">세일</span>}
      {product.hot && <span className="sst-qo__badge sst-qo__badge--hot">인기</span>}
      {inStock ? (
        <span className="sst-qo__badge sst-qo__badge--in">재고 있음</span>
      ) : (
        <span className="sst-qo__badge sst-qo__badge--out">품절</span>
      )}
    </span>
  );
}

/** Shop price (see price.ts); a struck regular price only when the rounded prices differ. */
function OfferPrice({ price }: { price: Price | null }) {
  if (!price) {
    return (
      <span className="sst-qo__offer-price sst-qo__offer-price--empty" aria-hidden="true">
        &nbsp;
      </span>
    );
  }
  if (price.regular) {
    return (
      <span className="sst-qo__offer-price sst-qo__offer-price--sale">
        <span className="sst-qo__sale-prices">
          <del className="sst-qo__sale-regular">
            <PriceAmount won={price.regular} bdi />
          </del>
          <ins className="sst-qo__sale-current">
            <PriceAmount won={price.pay} bdi />
          </ins>
        </span>
      </span>
    );
  }
  return (
    <span className="sst-qo__offer-price">
      <PriceAmount won={price.pay} />
    </span>
  );
}

function OfferCell({ product, offer }: { product: Product; offer: Offer }) {
  const { qtyFor, setQty } = useStore();
  const qty = qtyFor(offer.variantId);
  const name = offer.cartName ?? product.name;
  const price = offerPrice(product, offer);
  const line = {
    variantId: offer.variantId,
    handle: product.handle,
    name,
    img: product.img.src,
    priceWon: price?.pay ?? 0,
    max: offer.max,
  };
  const preorder = product.preorder;
  // Sale styling only while a discount is actually shown (rounding can make both prices equal).
  const sale = Boolean(price?.regular);
  const classes = offer.classes.filter((c) => c !== "sst-qo__offer--sale" || sale);
  const tdClass = ["sst-qo__offer", ...classes, preorder ? "sst-qo__offer--preorder" : ""].filter(Boolean).join(" ");
  const cardClass = [
    "sst-qo__offer-cell sst-qo__offer-card",
    `sst-qo__offer-cell--${offer.type}`,
    preorder ? "sst-qo__offer-card--preorder" : "",
    sale ? "sst-qo__offer-card--sale" : "",
  ]
    .filter(Boolean)
    .join(" ");

  let action;
  if (offer.actionKind === "qty") {
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
  } else if (offer.actionKind === "not-sold") {
    action = (
      <span className="sst-qo__not-sold" data-qo-action-state="quote">
        This item is currently not sold on this site.
      </span>
    );
  } else {
    // Out of stock: the source's "Notify" (restock e-mail) button needs a store account and is left out.
    action = null;
  }

  return (
    <td
      className={tdClass}
      colSpan={offer.colSpan}
      data-stock-state={offer.stockState}
      data-qo-offer-type={offer.type}
      data-qo-price-state={offer.priceState}
      data-qo-stock-state={offer.stockState}
      data-qo-action-state={offer.action}
      data-qo-max-qty={offer.max}
      data-qo-sale={sale ? 1 : 0}
      data-qo-backorder={0}
    >
      <div className={cardClass} data-qo-action-state={offer.action} data-qo-sale={sale ? 1 : 0}>
        <div className="sst-qo__offer-info">
          <span className="sst-qo__offer-label" {...(offer.type === "noshrink" ? { title: "NO SHRINK란?" } : {})}>
            {offer.label}
          </span>
          <span className={`sst-qo__offer-stock sst-qo__stock--${offer.stockState}`}>{offer.stockText}</span>
          <OfferPrice price={price} />
        </div>
        <div className="sst-qo__offer-action">{action}</div>
      </div>
    </td>
  );
}

export function ProductRow({ product }: { product: Product }) {
  const { img, rating } = product;
  // The source marks sale rows; keep that only while a struck-through price is actually shown.
  const onSale = product.sale && product.offers.some((o) => offerPrice(product, o)?.regular);
  const rowClass =
    (product.rowClass ?? "")
      .split(" ")
      .filter((c) => c && (onSale || (c !== "sst-qo__row--sale" && c !== "sst-qo__row--flash")))
      .join(" ") || undefined;

  return (
    <tr
      className={rowClass}
      data-handle={product.handle}
      data-group={product.group}
      data-qo-row-key={product.key}
      data-qo-group={product.group}
      data-qo-family={product.group.split("-")[0]}
      data-qo-subgroup={product.subgroup}
      data-qo-offer-count={product.offers.length}
      data-qo-single-offer={product.offers.length === 1 ? 1 : 0}
      data-qo-price-yen={product.priceYen}
      data-qo-stock-total={product.stockTotal}
      data-qo-handle={product.handle}
      data-qo-media-variant={img.variant}
      data-qo-hot={product.hot ? 1 : 0}
      data-qo-sale={onSale ? 1 : 0}
      data-qo-flash={onSale && product.flash ? 1 : undefined}
      data-qo-preorder={product.preorder ? 1 : 0}
      data-sst-rs={rating ? 1 : 0}
    >
      <td>
        {/* Product pages are not part of the clone, so the product block is not a link. */}
        <div className="sst-qo__prod">
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
            <Badges product={product} onSale={onSale} />
            <span className="sst-qo__pname">{product.name}</span>
            {rating && (
              <span className="sst-rs sst-rs--qo sst-rs-qo">
                <RsStars avg={rating.avg} label={`${rating.avg.toFixed(1)} / 5`} />
                <span className="sst-rs__avg">{rating.avg.toFixed(1)}</span>
                <span className="sst-rs__count">({rating.count})</span>
              </span>
            )}
            {product.jan && <span className="sst-qo__jan">{product.jan}</span>}
          </span>
        </div>
      </td>
      {product.offers.map((o) => (
        <OfferCell key={o.variantId || o.type} product={product} offer={o} />
      ))}
    </tr>
  );
}
