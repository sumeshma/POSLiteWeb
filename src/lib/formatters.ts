const DEFAULT_LOCALE = "en-IN";

export function formatNumber(
  value: number,
  options?: {
    locale?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  },
): string {
  return new Intl.NumberFormat(options?.locale ?? DEFAULT_LOCALE, {
    minimumFractionDigits: options?.minimumFractionDigits ?? 0,
    maximumFractionDigits: options?.maximumFractionDigits ?? 2,
  }).format(value);
}

export function formatPercent(
  value: number,
  options?: {
    locale?: string;
    maximumFractionDigits?: number;
  },
): string {
  return new Intl.NumberFormat(options?.locale ?? DEFAULT_LOCALE, {
    style: "percent",
    maximumFractionDigits: options?.maximumFractionDigits ?? 2,
  }).format(value);
}

export function formatQuantity(value: number): string {
  return formatNumber(value, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}
