import type { Offer } from "./types";

/**
 * Display prices. Product data keeps the source prices in JPY; everything
 * shown on screen goes through this file, which converts to KRW, applies
 * PRICE_FACTOR and rounds to ROUND_STEP.
 */

/** JPY → KRW rate (open.er-api.com, 2026-11-04: 1 JPY = 8.4888 KRW). */
export const JPY_TO_KRW = 8.49;

/** Shown price relative to the source price (1 = source price, 0.5 = half price). */
export const PRICE_FACTOR = 0.75;

/** Prices are rounded to the nearest multiple of this step (₩147,600 → ₩150,000, ₩146,200 → ₩145,000). */
export const ROUND_STEP = 5000;

/** A no-shrink box is shown this much cheaper than the sealed box of the same product (0.1 = 10%). */
export const NOSHRINK_DISCOUNT = 0.1;

export const CURRENCY_SYMBOL = "₩";

/** Rounds a won amount to the nearest ROUND_STEP; anything above zero shows at least one step. */
function roundWon(won: number): number {
  if (won <= 0) return 0;
  return Math.max(ROUND_STEP, Math.round(won / ROUND_STEP) * ROUND_STEP);
}

/** Won amount shown for a source price in yen. */
export function toWon(yen: number): number {
  return roundWon(yen * JPY_TO_KRW * PRICE_FACTOR);
}

/** Formats an amount that is already in won, e.g. ₩140,000. */
export function formatWon(won: number): string {
  return `${CURRENCY_SYMBOL}${won.toLocaleString("ko-KR")}`;
}

/** Full price label for a source price in yen, e.g. ₩140,000. */
export function formatPrice(yen: number): string {
  return formatWon(toWon(yen));
}

/** Parses a source price label such as "¥21,054" back to yen. */
export function yenFromText(text: string): number {
  return Number(text.replace(/[^\d]/g, "")) || 0;
}

export interface WonPricing {
  /** Price shown and charged, in won. */
  pay: number;
  /** Struck-through regular price in won; only set when it is above `pay`. */
  regular?: number;
}

function withRegular(pay: number, regular: number | undefined): WonPricing {
  // If rounding erased the discount, show one price instead of an identical struck-through one.
  return regular && regular > pay ? { pay, regular } : { pay };
}

function sealedSibling(offers: Offer[]): Offer | undefined {
  return offers.find((o) => o.type === "sealed" && o.priceYen > 0);
}

/**
 * Displayed won prices for an offer, given all offers of the same product.
 *
 * No-shrink boxes are priced from the sealed box's displayed price:
 * sealed × (1 − NOSHRINK_DISCOUNT), rounded like every other price (₩60,000 → ₩55,000).
 * When the source had the no-shrink box on sale, the same sale ratio is applied
 * on top and the pre-sale amount is shown struck through.
 */
export function offerWon(offer: Offer, offers: Offer[]): WonPricing {
  const saleRegularYen = offer.saleRegular ? yenFromText(offer.saleRegular) : 0;
  const saleCurrentYen = offer.saleCurrent ? yenFromText(offer.saleCurrent) : 0;
  const saleRatio = saleRegularYen && saleCurrentYen ? saleCurrentYen / saleRegularYen : 1;

  const sealed = offer.type === "noshrink" ? sealedSibling(offers) : undefined;
  if (sealed) {
    const sealedPay = offerWon(sealed, offers).pay;
    const base = sealedPay * (1 - NOSHRINK_DISCOUNT);
    let pay = roundWon(base * saleRatio);
    // Rounding must never make the no-shrink box cost the same as (or more than) the sealed one.
    if (pay >= sealedPay) pay = Math.max(ROUND_STEP, sealedPay - ROUND_STEP);
    return withRegular(pay, saleRatio < 1 ? roundWon(base) : undefined);
  }

  const pay = toWon(saleCurrentYen || offer.priceYen);
  return withRegular(pay, saleCurrentYen ? toWon(saleRegularYen) : undefined);
}
