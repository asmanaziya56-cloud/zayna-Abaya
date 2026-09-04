/**
 * Formats amount from smallest currency unit (paise) to standard Indian Rupee string
 * @param amountInPaise Amount in paise (e.g., 449900 = ₹4,499.00)
 * @param includeDecimals Whether to show decimals (defaults to false for clean luxury pricing)
 */
export function formatINR(amountInPaise: number | undefined | null, includeDecimals = false): string {
  if (amountInPaise === undefined || amountInPaise === null || isNaN(amountInPaise)) {
    return '₹0';
  }

  const rupees = amountInPaise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0
  }).format(rupees);
}

/**
 * Calculates discount percentage between original price and sale price
 */
export function calculateDiscountPercent(price: number, salePrice?: number): number {
  if (!salePrice || salePrice >= price) return 0;
  return Math.round(((price - salePrice) / price) * 100);
}
