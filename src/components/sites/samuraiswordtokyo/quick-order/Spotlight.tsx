"use client";

/* eslint-disable @next/next/no-img-element */
import "./spotlight.css";
import { formatWon, offerPrice } from "../price";
import { SPOTLIGHT_BANNER_IMG, SPOTLIGHT_PRODUCT } from "../shop";
import { useStore } from "../store";

/**
 * Banner for the owner's spotlight product (shop.ts) above the Pokemon list.
 * "장바구니 담기" adds one to the same cart line as the list card's stepper and opens the cart.
 */
export function Spotlight() {
  const { qtyFor, setQty, setCartOpen } = useStore();
  const product = SPOTLIGHT_PRODUCT;
  const offer = product.offers[0];
  const price = offerPrice(product, offer);
  const qty = qtyFor(offer.variantId);
  const badges = [...(product.promoBadges ?? []), offer.label];

  const add = () => {
    setQty(
      {
        variantId: offer.variantId,
        handle: product.handle,
        name: offer.cartName ?? product.name,
        img: product.img.src,
        priceWon: price?.pay ?? 0,
        max: offer.max,
      },
      qty + 1,
    );
    setCartOpen(true);
  };

  return (
    <section className="sst-spot" aria-labelledby="sst-spot-name" data-qo-handle={product.handle}>
      <div className="sst-spot__media">
        <img src={SPOTLIGHT_BANNER_IMG} alt={product.img.alt} width={640} height={640} />
      </div>
      <div className="sst-spot__body">
        <div className="sst-spot__badges">
          {badges.map((badge, i) => (
            <span key={badge} className={i === 0 ? "sst-spot__badge sst-spot__badge--best" : "sst-spot__badge"}>
              {badge}
            </span>
          ))}
        </div>
        <h2 id="sst-spot-name" className="sst-spot__name">
          {product.name}
        </h2>
        {price && <p className="sst-spot__price">{formatWon(price.pay)}</p>}
        <button type="button" className="sst-spot__add" onClick={add} disabled={qty >= offer.max}>
          {qty > 0 ? `장바구니 담기 (${qty}개 담김)` : "장바구니 담기"}
        </button>
      </div>
    </section>
  );
}
