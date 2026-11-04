/**
 * Display prices. Product data keeps the source prices in JPY; everything
 * shown on screen goes through formatPrice(), which converts to KRW and
 * applies PRICE_FACTOR.
 */

/** JPY → KRW rate (open.er-api.com, 2026-11-04: 1 JPY = 8.4888 KRW). */
export const JPY_TO_KRW = 8.49;

/** Shown price relative to the source price (1 = source price, 0.5 = half price). */
export const PRICE_FACTOR = 0.75;

export const CURRENCY_SYMBOL = "₩";

/** Prices are rounded to the nearest multiple of this step (₩147,600 → ₩150,000, ₩146,200 → ₩145,000). */
export const ROUND_STEP = 5000;

/**
 * Won amount shown for a source price in yen: converted, scaled by
 * PRICE_FACTOR, then rounded to the nearest ROUND_STEP. Anything priced above
 * zero shows at least one step (₩5,000) instead of ₩0.
 */
export function toWon(yen: number): number {
  const won = yen * JPY_TO_KRW * PRICE_FACTOR;
  if (won <= 0) return 0;
  return Math.max(ROUND_STEP, Math.round(won / ROUND_STEP) * ROUND_STEP);
}

/** Formats an amount that is already in won, e.g. ₩140,000. */
export function formatWon(won: number): string {
  return `${CURRENCY_SYMBOL}${won.toLocaleString("ko-KR")}`;
}

/** Number part only, e.g. 140,000 (the symbol is rendered separately in product cards). */
export function formatAmount(yen: number): string {
  return toWon(yen).toLocaleString("ko-KR");
}

/** Full price label for a source price in yen, e.g. ₩140,000. */
export function formatPrice(yen: number): string {
  return formatWon(toWon(yen));
}

/** Parses a source price label such as "¥21,054" back to yen. */
export function yenFromText(text: string): number {
  return Number(text.replace(/[^\d]/g, "")) || 0;
}
