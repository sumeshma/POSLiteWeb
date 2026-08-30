const DEFAULT_LOCALE = "en-IN";
const DEFAULT_CURRENCY = "INR";

export function formatCurrency(
  value: number,
  options?: {
    currency?: string;
    locale?: string;
  },
): string {
  return new Intl.NumberFormat(options?.locale ?? DEFAULT_LOCALE, {
    style: "currency",
    currency: options?.currency ?? DEFAULT_CURRENCY,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
