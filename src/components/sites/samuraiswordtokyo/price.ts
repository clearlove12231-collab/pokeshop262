/**
 * Display prices. Product data keeps the source prices in JPY; everything
 * shown on screen goes through toWon(), which converts to KRW, applies
 * PRICE_FACTOR and rounds to ROUND_STEP.
 */

/** JPY → KRW rate (open.er-api.com, updated 2026-11-04 00:02 UTC: 1 JPY = 8.488834 KRW). */
export const JPY_TO_KRW = 8.4888;

/** Shown price relative to the source price (0.58 = 58% of the source price). */
export const PRICE_FACTOR = 0.58;

/** Prices are rounded to the nearest multiple of this step (₩47,400 → ₩45,000, ₩47,600 → ₩50,000). */
export const ROUND_STEP = 5000;

export const CURRENCY_SYMBOL = "₩";

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

/** Number part only, e.g. 50,000 (product cards render the symbol separately). */
export function formatAmount(won: number): string {
  return won.toLocaleString("ko-KR");
}

/** Full label for an amount already in won, e.g. ₩50,000. */
export function formatWon(won: number): string {
  return `${CURRENCY_SYMBOL}${formatAmount(won)}`;
}

/** Full label for a source price in yen, e.g. ¥10,000 → ₩50,000. */
export function formatPrice(yen: number): string {
  return formatWon(toWon(yen));
}
