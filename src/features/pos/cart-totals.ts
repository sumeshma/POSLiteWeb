import type { CartLine } from "./cart-state";

/**
 * Cart preview totals.
 * Verified on DEV with GST disabled: line net = unitPrice * qty - item discount;
 * bill subTotal is the sum of line nets; tax/CGST/SGST were 0.
 * Tax is not estimated here. Final totals come from checkout.
 */
export function lineNet(line: CartLine): number {
  return Math.max(0, line.unitPrice * line.quantity - line.discountAmount);
}

export function estimateCartTotals(
  lines: CartLine[],
  billDiscount: number,
  packagingCharge: number,
) {
  const subTotal = lines.reduce((sum, line) => sum + lineNet(line), 0);
  const discountAmount = Math.max(0, billDiscount);
  const packaging = Math.max(0, packagingCharge);
  const totalAmount = Math.max(0, subTotal - discountAmount + packaging);
  return {
    subTotal,
    discountAmount,
    packagingCharge: packaging,
    totalAmount,
  };
}
