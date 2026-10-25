export function creditInvoicePath(invoiceNumber: string): string {
  return `/credit-invoices/invoice?number=${encodeURIComponent(invoiceNumber)}`;
}

/** Shop calendar date for credit reports (IST). */
export function creditShopToday(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
