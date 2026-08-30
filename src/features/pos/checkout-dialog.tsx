"use client";

import { useMemo, useState } from "react";
import { Banknote } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormDialog } from "@/components/shared/form-dialog";
import { FormField } from "@/components/shared/form-field";
import { formatCurrency } from "@/lib/currency";
import { PAYMENT_METHODS, type PaymentMethod } from "@/types/billing";
import type { CartState } from "./cart-state";
import { estimateCartTotals } from "./cart-totals";

type CheckoutDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cart: CartState;
  submitting: boolean;
  error?: string;
  onConfirm: (input: {
    paymentMethod: PaymentMethod;
    amountPaid: number;
    paymentReference: string;
    notes: string;
  }) => void;
};

function paymentLabel(method: PaymentMethod): string {
  if (method === "Upi") {
    return "UPI";
  }
  return method;
}

export function CheckoutDialog({
  open,
  onOpenChange,
  cart,
  submitting,
  error,
  onConfirm,
}: CheckoutDialogProps) {
  const totals = estimateCartTotals(cart.lines, cart.billDiscount, cart.packagingCharge);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Cash");
  const [amountPaid, setAmountPaid] = useState(() => String(totals.totalAmount));
  const [paymentReference, setPaymentReference] = useState("");
  const [notes, setNotes] = useState(cart.notes);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const paid = Number(amountPaid);
  const exactRequired = paymentMethod !== "Cash";
  const change = useMemo(() => {
    if (paymentMethod !== "Cash" || !Number.isFinite(paid)) {
      return 0;
    }
    return Math.max(0, paid - totals.totalAmount);
  }, [paid, paymentMethod, totals.totalAmount]);

  function handleSubmit() {
    if (cart.orderType === "Parcel" && cart.packagingCharge <= 0) {
      setFieldError("Parcel orders require a packaging charge greater than zero.");
      return;
    }
    if (!Number.isFinite(paid) || paid <= 0) {
      setFieldError("Amount paid must be greater than zero.");
      return;
    }
    if (paymentMethod === "Cash" && paid < totals.totalAmount) {
      setFieldError("Amount paid is less than the bill total.");
      return;
    }
    if (exactRequired && paid !== totals.totalAmount) {
      setFieldError("UPI and card payments must match the bill total exactly.");
      return;
    }
    setFieldError(null);
    onConfirm({
      paymentMethod,
      amountPaid: paid,
      paymentReference: paymentReference.trim(),
      notes: notes.trim(),
    });
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Checkout"
      description="Payment is processed by the backend. The cart is cleared only after a successful bill."
      icon={Banknote}
      size="md"
      isDirty={false}
      isSubmitting={submitting}
      submitLabel={`Pay ${formatCurrency(totals.totalAmount)}`}
      onSubmit={handleSubmit}
    >
      {error || fieldError ? (
        <Alert variant="destructive">
          <AlertDescription>{fieldError || error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="rounded-lg bg-muted/50 p-3">
        <p className="text-xs text-muted-foreground">Amount payable</p>
        <p className="font-heading text-2xl font-semibold tabular-nums">
          {formatCurrency(totals.totalAmount)}
        </p>
        <p className="text-xs text-muted-foreground">{cart.orderType} order</p>
      </div>

      <FormField label="Payment method" required>
        <Select
          value={paymentMethod}
          onValueChange={(value) => {
            const next = (value as PaymentMethod) || "Cash";
            setPaymentMethod(next);
            if (next !== "Cash") {
              setAmountPaid(String(totals.totalAmount));
            }
          }}
          disabled={submitting}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAYMENT_METHODS.map((method) => (
              <SelectItem key={method} value={method}>
                {paymentLabel(method)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <FormField
        label="Amount paid"
        htmlFor="pos-amount-paid"
        required
        description={
          paymentMethod === "Cash"
            ? change > 0
              ? `Change ${formatCurrency(change)}`
              : "Cash received can be greater than the total."
            : "Must match the bill total exactly."
        }
      >
        <Input
          id="pos-amount-paid"
          type="number"
          min={0}
          step="0.01"
          disabled={submitting || exactRequired}
          value={amountPaid}
          onChange={(event) => setAmountPaid(event.target.value)}
        />
      </FormField>

      {paymentMethod !== "Cash" ? (
        <FormField label="Payment reference" htmlFor="pos-pay-ref">
          <Input
            id="pos-pay-ref"
            disabled={submitting}
            value={paymentReference}
            onChange={(event) => setPaymentReference(event.target.value)}
          />
        </FormField>
      ) : null}

      <FormField label="Notes" htmlFor="pos-notes">
        <Textarea
          id="pos-notes"
          disabled={submitting}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />
      </FormField>
    </FormDialog>
  );
}
