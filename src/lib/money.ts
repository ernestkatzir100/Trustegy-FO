/**
 * Converts ILS amount to agorot (integer).
 * Example: toAgorot(1054975) → 105497500
 */
export function toAgorot(ils: number): number {
  return Math.round(ils * 100);
}

/**
 * Converts agorot to ILS for display.
 * Example: fromAgorot(105497500) → 1054975
 */
export function fromAgorot(agorot: number): number {
  return agorot / 100;
}

/**
 * Formats agorot as ILS currency string.
 * Example: formatILS(105497500) → "₪1,054,975"
 * Pass showDecimals: true for exact amounts (e.g., invoices).
 */
export function formatILS(agorot: number, showDecimals = false): string {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(fromAgorot(agorot));
}

/**
 * Calculates VAT amount in agorot using integer math.
 * vatRateBp is in basis points (17% = 1700).
 * Uses floor (truncate) — never rounds up.
 * Example: calculateVat(100000, 1700) → 17000
 */
export function calculateVat(baseAgorot: number, vatRateBp: number): number {
  return Math.floor((baseAgorot * vatRateBp) / 10000);
}
