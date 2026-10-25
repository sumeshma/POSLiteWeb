"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Undo2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/auth-provider";
import { PageHeader } from "@/components/layout/page-header";
import { FormDialog } from "@/components/shared/form-dialog";
import { FormField } from "@/components/shared/form-field";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingState } from "@/components/shared/loading-state";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { KpiCard, formatKpiCurrency } from "@/features/dashboard/kpi-card";
import { formatDateTime } from "@/lib/date";
import { formatCurrency } from "@/lib/currency";
import { emptyToNull } from "@/lib/empty";
import { createIdempotencyKey, shouldReplaceIdempotencyKey } from "@/lib/idempotency";
import { getMutationErrorMessage, isValidationError } from "@/lib/mutation-errors";
import { printHtmlDocument } from "@/lib/print";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/types/api";
import {
  CREDIT_INVOICE_PAYMENT_METHODS,
  type CreditInvoicePayment,
  type CreditInvoicePaymentMethod,
  type CreditInvoicePaymentResult,
} from "@/types/credit-invoice";
import { CreditInvoiceScreen } from "./credit-invoice-screen";
import { CreditStatusBadge } from "./credit-status-badge";
import { printCreditInvoiceHtml, printCreditReceiptHtml } from "./print-credit-invoice";
import { useCreditInvoiceAccess } from "./use-credit-invoice-access";
import {
  useCreditInvoiceByNumberQuery,
  useCreditInvoiceMutations,
  useCreditInvoicePaymentsQuery,
} from "./use-credit-invoices";

export function CreditInvoiceDetailPage() {
  const searchParams = useSearchParams();
  const invoiceNumber = searchParams.get("number")?.trim() ?? "";
  const { session } = useAuth();
  const access = useCreditInvoiceAccess();
  const shopName = session?.shopDisplayName?.trim() || session?.shopCode || "POS Lite";
  const invoiceQuery = useCreditInvoiceByNumberQuery(invoiceNumber, { enabled: access.canRead });
  const invoice = invoiceQuery.data ?? null;
  const paymentsQuery = useCreditInvoicePaymentsQuery(invoice?.id ?? null, {
    enabled: access.canRead && Boolean(invoice?.id),
  });
  const mutations = useCreditInvoiceMutations();
  const paymentKey = useRef<string | null>(null);
  const reverseKey = useRef<string | null>(null);
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<CreditInvoicePaymentMethod>("Cash");
  const [transactionReference, setTransactionReference] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [formError, setFormError] = useState<string | undefined>();
  const [lastReceipt, setLastReceipt] = useState<CreditInvoicePaymentResult | null>(null);
  const [reversePayment, setReversePayment] = useState<CreditInvoicePayment | null>(null);
  const [reverseReason, setReverseReason] = useState("");
  const [reverseError, setReverseError] = useState<string | undefined>();

  const status = invoice?.status ?? "";
  const canCollect =
    access.canMutate &&
    Boolean(invoice) &&
    status !== "Paid" &&
    status !== "Cancelled" &&
    (invoice?.balanceDue ?? 0) > 0;
  const payments = paymentsQuery.data?.payments ?? [];

  function printInvoice() {
    if (!invoice) {
      return;
    }
    printHtmlDocument(printCreditInvoiceHtml(invoice, shopName));
  }

  function printReceipt(payment: CreditInvoicePayment, balanceDue?: number | null) {
    printHtmlDocument(
      printCreditReceiptHtml(payment, {
        shopName,
        invoiceNumber: invoice?.invoiceNumber ?? invoiceNumber,
        customerName: invoice?.customerName ?? null,
        balanceDue,
      }),
    );
  }

  async function collectPayment() {
    if (!invoice) {
      return;
    }
    setFormError(undefined);
    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setFormError("Amount must be greater than 0.");
      return;
    }
    if (parsed > invoice.balanceDue) {
      setFormError("Amount cannot be greater than the balance due.");
      return;
    }
    if (!paymentKey.current) {
      paymentKey.current = createIdempotencyKey("web-pay");
    }
    try {
      const result = await mutations.collect.mutateAsync({
        id: invoice.id,
        body: {
          idempotencyKey: paymentKey.current,
          amount: parsed,
          paymentMethod,
          transactionReference: emptyToNull(transactionReference),
          notes: emptyToNull(paymentNotes),
        },
      });
      paymentKey.current = null;
      setAmount("");
      setTransactionReference("");
      setPaymentNotes("");
      setLastReceipt(result);
      toast.success(result.payment.receiptNumber ? `Collected ${result.payment.receiptNumber}` : "Payment collected");
    } catch (error) {
      if (shouldReplaceIdempotencyKey(error)) {
        paymentKey.current = null;
      }
      setFormError(getMutationErrorMessage(error));
      if (!isValidationError(error)) {
        toast.error("Unable to collect payment");
      }
    }
  }

  async function reverse() {
    if (!invoice || !reversePayment) {
      return;
    }
    const reason = reverseReason.trim();
    if (!reason) {
      setReverseError("A reason is required.");
      return;
    }
    if (reason.length > 200) {
      setReverseError("Reason must be 200 characters or less.");
      return;
    }
    if (!reverseKey.current) {
      reverseKey.current = createIdempotencyKey("web-rev");
    }
    try {
      const result = await mutations.reverse.mutateAsync({
        id: invoice.id,
        paymentId: reversePayment.id,
        body: { idempotencyKey: reverseKey.current, reason },
      });
      reverseKey.current = null;
      setReversePayment(null);
      setReverseReason("");
      setReverseError(undefined);
      setLastReceipt(result);
      toast.success("Payment reversed. Stock is unchanged.");
    } catch (error) {
      if (shouldReplaceIdempotencyKey(error)) {
        reverseKey.current = null;
      }
      setReverseError(getMutationErrorMessage(error));
      if (!isValidationError(error)) {
        toast.error("Unable to reverse payment");
      }
    }
  }

  return (
    <CreditInvoiceScreen mode="read">
      <PageHeader
        title={invoice?.invoiceNumber || invoiceNumber || "Credit invoice"}
        description="Payments and reversals change the balance. They do not change stock."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={printInvoice} disabled={!invoice}>
              Print invoice
            </Button>
            <Link href="/credit-invoices" className={cn(buttonVariants({ variant: "outline" }))}>
              Back
            </Link>
          </div>
        }
      />

      {!invoiceNumber ? (
        <EmptyState title="Enter an invoice number" description="Open a credit invoice from the list or the lookup on the credit home page." />
      ) : invoiceQuery.isLoading ? (
        <LoadingState label="Loading invoice..." />
      ) : invoiceQuery.isError ? (
        <ErrorState
          title="Unable to load invoice"
          description={getErrorMessage(invoiceQuery.error)}
          onRetry={() => void invoiceQuery.refetch()}
        />
      ) : invoice ? (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <CreditStatusBadge status={invoice.status} />
            <p className="text-sm text-muted-foreground">
              {invoice.customerName || "Customer"}
              {invoice.customerPhone ? ` · ${invoice.customerPhone}` : ""}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <KpiCard label="Total" value={formatKpiCurrency(invoice.totalAmount)} />
            <KpiCard label="Paid" value={formatKpiCurrency(invoice.amountPaid)} tone="secondary" />
            <KpiCard label="Balance" value={formatKpiCurrency(invoice.balanceDue)} tone="warning" />
          </div>

          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="tabular-nums">{formatCurrency(invoice.subTotal)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Discount</dt>
              <dd className="tabular-nums">{formatCurrency(invoice.discountAmount)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Packaging</dt>
              <dd className="tabular-nums">{formatCurrency(invoice.packagingCharge)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Tax</dt>
              <dd className="tabular-nums">{formatCurrency(invoice.taxAmount)}</dd>
            </div>
          </dl>

          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="border-b text-left text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-medium">Item</th>
                  <th className="px-3 py-2 font-medium">Qty</th>
                  <th className="px-3 py-2 font-medium">Price</th>
                  <th className="px-3 py-2 font-medium">Tax</th>
                  <th className="px-3 py-2 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {(invoice.items ?? []).map((item) => (
                  <tr key={`${item.productId}-${item.productName}`} className="border-b last:border-b-0">
                    <td className="px-3 py-2">
                      <p>{item.productName || "Item"}</p>
                      <p className="text-xs text-muted-foreground">
                        {[item.sku, item.size].filter(Boolean).join(" · ") || "—"}
                      </p>
                    </td>
                    <td className="px-3 py-2 tabular-nums">{item.quantity}</td>
                    <td className="px-3 py-2 tabular-nums">{formatCurrency(item.unitPrice)}</td>
                    <td className="px-3 py-2 tabular-nums">{formatCurrency(item.taxAmount)}</td>
                    <td className="px-3 py-2 tabular-nums">{formatCurrency(item.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <section className="space-y-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-sm font-medium">Payments</h2>
              <p className="text-sm text-muted-foreground">
                Net collected {formatCurrency(paymentsQuery.data?.netAmountCollected ?? 0)}
              </p>
            </div>
            {paymentsQuery.isLoading ? (
              <LoadingState label="Loading payments..." />
            ) : paymentsQuery.isError ? (
              <ErrorState
                title="Unable to load payments"
                description={getErrorMessage(paymentsQuery.error)}
                onRetry={() => void paymentsQuery.refetch()}
              />
            ) : payments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No payments yet.</p>
            ) : (
              <ul className="divide-y rounded-lg border">
                {payments.map((payment) => (
                  <li key={payment.id} className="flex flex-wrap items-center justify-between gap-3 px-3 py-2">
                    <div>
                      <p className="text-sm font-medium">{payment.receiptNumber || "Receipt"}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(payment.paidAt) || payment.paidAt} · {payment.paymentMethod || "—"} ·{" "}
                        {formatCurrency(payment.amount)}
                      </p>
                      {payment.reversalReason ? (
                        <p className="text-xs text-muted-foreground">Reversed: {payment.reversalReason}</p>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditStatusBadge status={payment.status} />
                      <Button type="button" size="sm" variant="outline" onClick={() => printReceipt(payment)}>
                        Print
                      </Button>
                      {access.canMutate && payment.status === "Posted" ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setReversePayment(payment);
                            setReverseReason("");
                            setReverseError(undefined);
                            reverseKey.current = null;
                          }}
                        >
                          <Undo2 className="size-4" />
                          Reverse
                        </Button>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {lastReceipt ? (
            <Alert>
              <AlertDescription className="flex flex-wrap items-center justify-between gap-2">
                <span>
                  {lastReceipt.payment.receiptNumber || "Receipt"} · {lastReceipt.invoiceStatus || "Updated"} ·
                  balance {formatCurrency(lastReceipt.balanceDue)}
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => printReceipt(lastReceipt.payment, lastReceipt.balanceDue)}
                >
                  Print receipt
                </Button>
              </AlertDescription>
            </Alert>
          ) : null}

          {canCollect ? (
            <section className="space-y-3 rounded-lg border p-4">
              <h2 className="text-sm font-medium">Collect payment</h2>
              {formError ? (
                <Alert variant="destructive">
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              ) : null}
              <div className="grid gap-3 md:grid-cols-2">
                <FormField label="Amount" htmlFor="credit-pay-amount" required>
                  <Input
                    id="credit-pay-amount"
                    type="number"
                    min={0}
                    step="0.01"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    disabled={mutations.collect.isPending}
                  />
                </FormField>
                <FormField label="Method">
                  <Select
                    value={paymentMethod}
                    onValueChange={(value) => {
                      if (value === "Cash" || value === "UPI" || value === "Card") {
                        setPaymentMethod(value);
                      }
                    }}
                    disabled={mutations.collect.isPending}
                  >
                    <SelectTrigger className="w-full" aria-label="Payment method">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CREDIT_INVOICE_PAYMENT_METHODS.map((method) => (
                        <SelectItem key={method} value={method}>
                          {method}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Reference" htmlFor="credit-pay-ref">
                  <Input
                    id="credit-pay-ref"
                    value={transactionReference}
                    onChange={(event) => setTransactionReference(event.target.value)}
                    disabled={mutations.collect.isPending}
                  />
                </FormField>
                <FormField label="Notes" htmlFor="credit-pay-notes">
                  <Textarea
                    id="credit-pay-notes"
                    value={paymentNotes}
                    onChange={(event) => setPaymentNotes(event.target.value)}
                    disabled={mutations.collect.isPending}
                  />
                </FormField>
              </div>
              <div className="flex justify-end">
                <Button type="button" onClick={() => void collectPayment()} disabled={mutations.collect.isPending}>
                  {mutations.collect.isPending ? "Collecting..." : "Collect"}
                </Button>
              </div>
            </section>
          ) : null}
        </div>
      ) : null}

      <FormDialog
        open={Boolean(reversePayment)}
        onOpenChange={(open) => {
          if (!open) {
            setReversePayment(null);
            setReverseError(undefined);
          }
        }}
        title="Reverse payment"
        description="The invoice balance goes back up. Stock is not restored, and there is no cancel-invoice action."
        icon={Undo2}
        isDirty={reverseReason.trim().length > 0}
        isSubmitting={mutations.reverse.isPending}
        submitLabel="Reverse payment"
        onSubmit={() => void reverse()}
      >
        {reverseError ? (
          <Alert variant="destructive">
            <AlertDescription>{reverseError}</AlertDescription>
          </Alert>
        ) : null}
        <FormField label="Reason" htmlFor="credit-reverse-reason" required>
          <Textarea
            id="credit-reverse-reason"
            value={reverseReason}
            maxLength={200}
            onChange={(event) => setReverseReason(event.target.value)}
            disabled={mutations.reverse.isPending}
          />
        </FormField>
      </FormDialog>
    </CreditInvoiceScreen>
  );
}
