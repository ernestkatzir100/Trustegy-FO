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
 * Example: formatILS(105497500) → "₪1,054,975.00"
 */
export function formatILS(agorot: number): string {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
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
