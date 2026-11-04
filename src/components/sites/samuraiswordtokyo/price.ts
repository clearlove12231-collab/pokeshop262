/**
 * Display prices. Product data keeps the source prices in JPY; everything
 * shown on screen goes through shopWon() / offerPrice():
 *
 *   source yen × JPY_TO_KRW × PRICE_FACTOR, rounded to ROUND_STEP, + PRICE_MARKUP_WON
 *
 * and a "슈링크 없음" (no-shrink) offer costs NOSHRINK_DISCOUNT less than the
 * same product's sealed offer.
 */
import type { Offer, Product } from "./types";

/** JPY → KRW rate (open.er-api.com, updated 2026-11-04 00:02 UTC: 1 JPY = 8.488834 KRW). */
export const JPY_TO_KRW = 8.4888;

/** Shown price relative to the source price (0.58 = 58% of the source price). */
export const PRICE_FACTOR = 0.58;

/** Prices are rounded to the nearest multiple of this step (₩47,400 → ₩45,000, ₩47,600 → ₩50,000). */
export const ROUND_STEP = 5000;

/** Added to every converted price (a multiple of ROUND_STEP, so prices stay on ₩5,000 steps). */
export const PRICE_MARKUP_WON = 50000;

/** No-shrink offers cost this much less than the sealed offer of the same product. */
export const NOSHRINK_DISCOUNT = 0.15;

export const CURRENCY_SYMBOL = "₩";

const roundWon = (won: number) => Math.round(won / ROUND_STEP) * ROUND_STEP;

/** Source yen converted and scaled by PRICE_FACTOR, rounded (at least one step for anything priced). */
export function toWon(yen: number): number {
  const won = yen * JPY_TO_KRW * PRICE_FACTOR;
  if (won <= 0) return 0;
  return Math.max(ROUND_STEP, roundWon(won));
}

/** Shop price for a source price in yen: toWon() + PRICE_MARKUP_WON (0 stays 0). */
export function shopWon(yen: number): number {
  return yen > 0 ? toWon(yen) + PRICE_MARKUP_WON : 0;
}

export interface OfferPrice {
  /** What the customer pays (shown, and used by the cart). */
  pay: number;
  /** Struck-through regular price when the offer is on sale and the rounded prices differ. */
  regular?: number;
}

/**
 * Price shown for an offer, or null when the source shows none ("ASK" / missing).
 * A no-shrink offer is priced from the same product's sealed offer: its paid
 * price minus NOSHRINK_DISCOUNT, rounded to ROUND_STEP, always below the sealed price.
 */
export function offerPrice(product: Product, offer: Offer): OfferPrice | null {
  if (offer.priceState !== "priced") return null;
  if (offer.type === "noshrink") {
    const sealed = product.offers.find((o) => o.type === "sealed" && o.priceState === "priced");
    const sealedPay = sealed ? offerPrice(product, sealed)?.pay : undefined;
    if (sealedPay) return { pay: Math.min(roundWon(sealedPay * (1 - NOSHRINK_DISCOUNT)), sealedPay - ROUND_STEP) };
  }
  const pay = shopWon(offer.priceYen);
  const regular = offer.saleRegularYen ? shopWon(offer.saleRegularYen) : 0;
  return regular && regular !== pay ? { pay, regular } : { pay };
}

/** Number part only, e.g. 100,000 (product cards render the symbol separately). */
export function formatAmount(won: number): string {
  return won.toLocaleString("ko-KR");
}

/** Full label for an amount already in won, e.g. ₩100,000. */
export function formatWon(won: number): string {
  return `${CURRENCY_SYMBOL}${formatAmount(won)}`;
}

/** Full label for a source price in yen at shop prices, e.g. ¥10,000 → ₩100,000. */
export function formatPrice(yen: number): string {
  return formatWon(shopWon(yen));
}
