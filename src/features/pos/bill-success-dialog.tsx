"use client";

import { CircleCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/currency";
import { formatDateTime } from "@/lib/date";
import type { Bill } from "@/types/billing";

type BillSuccessDialogProps = {
  open: boolean;
  bill: Bill | null;
  printing: boolean;
  onOpenChange: (open: boolean) => void;
  onPrint: () => void;
};

function paymentLabel(value: string | null): string {
  if (value === "Upi") {
    return "UPI";
  }
  return value || "—";
}

export function BillSuccessDialog({
  open,
  bill,
  printing,
  onOpenChange,
  onPrint,
}: BillSuccessDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md" showCloseButton>
        <DialogHeader icon={CircleCheck}>
          <DialogTitle>Sale completed</DialogTitle>
          <DialogDescription>
            {bill?.billNumber
              ? `Bill ${bill.billNumber} was created by the server.`
              : "The bill was created by the server."}
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
        {bill ? (
          <div id="pos-receipt" className="space-y-3 text-sm">
            <div>
              <p className="font-heading text-lg font-semibold">{bill.billNumber || "Bill"}</p>
              <p className="text-xs text-muted-foreground">{formatDateTime(bill.createdAt)}</p>
              <p className="text-xs text-muted-foreground">
                {bill.cashierName || "Cashier"} · {bill.orderType} · {paymentLabel(bill.paymentMethod)}
              </p>
            </div>
            <ul className="divide-y">
              {(bill.items ?? []).map((item) => (
                <li key={`${item.productId}-${item.productName}`} className="flex justify-between gap-3 py-2">
                  <div>
                    <p>{item.productName}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity} × {formatCurrency(item.unitPrice)}
                      {item.discountAmount > 0 ? ` − ${formatCurrency(item.discountAmount)}` : ""}
                    </p>
                  </div>
                  <p className="tabular-nums">{formatCurrency(item.lineTotal)}</p>
                </li>
              ))}
            </ul>
            <dl className="space-y-1">
              <div className="flex justify-between">
                <dt>Subtotal</dt>
                <dd className="tabular-nums">{formatCurrency(bill.subTotal)}</dd>
              </div>
              {bill.discountAmount > 0 ? (
                <div className="flex justify-between">
                  <dt>Discount</dt>
                  <dd className="tabular-nums">-{formatCurrency(bill.discountAmount)}</dd>
                </div>
              ) : null}
              {bill.packagingCharge > 0 ? (
                <div className="flex justify-between">
                  <dt>Packaging</dt>
                  <dd className="tabular-nums">{formatCurrency(bill.packagingCharge)}</dd>
                </div>
              ) : null}
              {bill.taxAmount > 0 ? (
                <div className="flex justify-between">
                  <dt>Tax</dt>
                  <dd className="tabular-nums">{formatCurrency(bill.taxAmount)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between font-semibold">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatCurrency(bill.totalAmount)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Paid</dt>
                <dd className="tabular-nums">{formatCurrency(bill.amountPaid)}</dd>
              </div>
              {bill.changeAmount > 0 ? (
                <div className="flex justify-between">
                  <dt>Change</dt>
                  <dd className="tabular-nums">{formatCurrency(bill.changeAmount)}</dd>
                </div>
              ) : null}
            </dl>
          </div>
        ) : null}
        </DialogBody>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button type="button" onClick={onPrint} disabled={!bill || printing}>
            Print
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function printBillHtml(bill: Bill, shopName: string) {
  const lines = (bill.items ?? [])
    .map(
      (item) =>
        `<tr><td>${escapeHtml(item.productName || "")} × ${item.quantity}</td><td style="text-align:right">${item.lineTotal.toFixed(2)}</td></tr>`,
    )
    .join("");
  return `<!doctype html><html><head><title>${escapeHtml(bill.billNumber || "Bill")}</title>
<style>body{font-family:ui-sans-serif,system-ui,sans-serif;padding:24px;color:#111}table{width:100%;border-collapse:collapse}td{padding:4px 0}h1{font-size:18px;margin:0}</style>
</head><body>
<h1>${escapeHtml(shopName || "POS Lite")}</h1>
<p>${escapeHtml(bill.billNumber || "")}<br/>${escapeHtml(bill.createdAt)}</p>
<table>${lines}</table>
<p><strong>Total ${bill.totalAmount.toFixed(2)}</strong><br/>Paid ${bill.amountPaid.toFixed(2)}
${bill.changeAmount > 0 ? `<br/>Change ${bill.changeAmount.toFixed(2)}` : ""}</p>
</body></html>`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
