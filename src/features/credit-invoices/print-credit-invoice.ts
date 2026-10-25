import type { CreditInvoice, CreditInvoicePayment } from "@/types/credit-invoice";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function money(value: number): string {
  return value.toFixed(2);
}

export function printCreditInvoiceHtml(invoice: CreditInvoice, shopName: string): string {
  const lines = (invoice.items ?? [])
    .map(
      (item) =>
        `<tr><td>${escapeHtml(item.productName || "Item")} × ${item.quantity}</td><td style="text-align:right">${money(item.lineTotal)}</td></tr>`,
    )
    .join("");
  const tax =
    invoice.taxAmount > 0
      ? `<br/>Tax ${money(invoice.taxAmount)} (CGST ${money(invoice.cgstAmount)} / SGST ${money(invoice.sgstAmount)})`
      : "";

  return `<!doctype html><html><head><title>${escapeHtml(invoice.invoiceNumber || "Credit invoice")}</title>
<style>body{font-family:ui-sans-serif,system-ui,sans-serif;padding:24px;color:#111}table{width:100%;border-collapse:collapse}td{padding:4px 0}h1{font-size:18px;margin:0}</style>
</head><body>
<h1>${escapeHtml(shopName || "POS Lite")}</h1>
<p>Credit invoice ${escapeHtml(invoice.invoiceNumber || "")}<br/>${escapeHtml(invoice.customerName || "")}${invoice.customerPhone ? `<br/>${escapeHtml(invoice.customerPhone)}` : ""}</p>
<table>${lines}</table>
<p>Subtotal ${money(invoice.subTotal)}<br/>Discount ${money(invoice.discountAmount)}<br/>Packaging ${money(invoice.packagingCharge)}${tax}
<br/><strong>Total ${money(invoice.totalAmount)}</strong><br/>Paid ${money(invoice.amountPaid)}<br/>Balance ${money(invoice.balanceDue)}</p>
</body></html>`;
}

export function printCreditReceiptHtml(
  payment: CreditInvoicePayment,
  details: {
    shopName: string;
    invoiceNumber: string | null;
    customerName: string | null;
    balanceDue?: number | null;
  },
): string {
  const balance =
    details.balanceDue === null || details.balanceDue === undefined
      ? ""
      : `<br/>Balance due ${money(details.balanceDue)}`;

  return `<!doctype html><html><head><title>${escapeHtml(payment.receiptNumber || "Receipt")}</title>
<style>body{font-family:ui-sans-serif,system-ui,sans-serif;padding:24px;color:#111}h1{font-size:18px;margin:0}</style>
</head><body>
<h1>${escapeHtml(details.shopName || "POS Lite")}</h1>
<p>Payment receipt ${escapeHtml(payment.receiptNumber || "")}<br/>Invoice ${escapeHtml(details.invoiceNumber || "")}
<br/>${escapeHtml(details.customerName || "")}<br/>${escapeHtml(payment.paidAt)}</p>
<p><strong>${money(payment.amount)}</strong> ${escapeHtml(payment.paymentMethod || "")}
${payment.transactionReference ? `<br/>Ref ${escapeHtml(payment.transactionReference)}` : ""}
<br/>Status ${escapeHtml(payment.status || "")}${balance}</p>
</body></html>`;
}
