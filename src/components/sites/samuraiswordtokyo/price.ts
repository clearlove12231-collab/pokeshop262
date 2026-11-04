/**
 * Display prices. Product data keeps the source prices in JPY; everything
 * shown on screen goes through formatPrice(), which converts to KRW and
 * applies PRICE_FACTOR.
 */

/** JPY → KRW rate (open.er-api.com, 2026-11-04: 1 JPY = 8.4888 KRW). */
export const JPY_TO_KRW = 8.49;

/** Shown price relative to the source price (1 = source price, 0.5 = half price). */
export const PRICE_FACTOR = 0.62;

export const CURRENCY_SYMBOL = "₩";

/** Won amount shown for a source price in yen, rounded to the nearest ₩100. */
export function toWon(yen: number): number {
  return Math.round((yen * JPY_TO_KRW * PRICE_FACTOR) / 100) * 100;
}

/** Number part only, e.g. 38,800 (the symbol is rendered separately in product cards). */
export function formatAmount(yen: number): string {
  return toWon(yen).toLocaleString("ko-KR");
}

/** Full price label, e.g. ₩38,800. */
export function formatPrice(yen: number): string {
  return `${CURRENCY_SYMBOL}${formatAmount(yen)}`;
}

/** Parses a source price label such as "¥21,054" back to yen. */
export function yenFromText(text: string): number {
  return Number(text.replace(/[^\d]/g, "")) || 0;
}
