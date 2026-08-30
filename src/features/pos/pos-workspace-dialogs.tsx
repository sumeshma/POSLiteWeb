"use client";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { BillSuccessDialog } from "./bill-success-dialog";
import { CheckoutDialog } from "./checkout-dialog";
import { CustomerPickerDialog } from "./customer-picker-dialog";
import { HeldOrdersDialog } from "./held-orders-dialog";
import type { PosWorkspace } from "./use-pos-workspace";

type PosWorkspaceDialogsProps = {
  pos: PosWorkspace;
};

export function PosWorkspaceDialogs({ pos }: PosWorkspaceDialogsProps) {
  return (
    <>
      <CheckoutDialog
        key={pos.checkoutOpen ? "checkout-open" : "checkout-closed"}
        open={pos.checkoutOpen}
        onOpenChange={pos.setCheckoutOpen}
        cart={pos.cart}
        submitting={pos.mutations.checkoutSale.isPending}
        error={pos.checkoutError}
        onConfirm={(input) => void pos.submitCheckout(input)}
      />
      <CustomerPickerDialog
        open={pos.customerOpen}
        onOpenChange={pos.setCustomerOpen}
        onSelect={(customer) => pos.dispatch({ type: "set-customer", customer })}
      />
      <HeldOrdersDialog
        open={pos.holdsOpen}
        onOpenChange={pos.setHoldsOpen}
        resuming={pos.mutations.resume.isPending}
        cancelling={pos.mutations.cancel.isPending}
        onResume={(hold) => {
          if (pos.cart.lines.length > 0) {
            pos.setResumeConfirm(hold);
            return;
          }
          void pos.resumeHold(hold);
        }}
        onCancel={pos.setCancelHold}
      />
      <BillSuccessDialog
        open={Boolean(pos.bill)}
        bill={pos.bill}
        printing={pos.mutations.print.isPending}
        onOpenChange={(open) => {
          if (!open) {
            pos.setBill(null);
          }
        }}
        onPrint={pos.printBill}
      />
      <ConfirmDialog
        open={pos.clearOpen}
        onOpenChange={pos.setClearOpen}
        title="Clear the current cart?"
        description="All items, discounts, and the selected customer will be removed."
        confirmLabel="Clear cart"
        onConfirm={() => {
          pos.dispatch({ type: "clear" });
          pos.setClearOpen(false);
        }}
      />
      <ConfirmDialog
        open={Boolean(pos.resumeConfirm)}
        onOpenChange={(open) => {
          if (!open) {
            pos.setResumeConfirm(null);
          }
        }}
        title="Replace the current cart?"
        description="Resuming this hold will replace the items currently in the cart."
        confirmLabel="Resume"
        destructive={false}
        loading={pos.mutations.resume.isPending}
        onConfirm={() => {
          if (pos.resumeConfirm) {
            void pos.resumeHold(pos.resumeConfirm);
          }
        }}
      />
      <ConfirmDialog
        open={Boolean(pos.cancelHold)}
        onOpenChange={(open) => {
          if (!open) {
            pos.setCancelHold(null);
          }
        }}
        title="Cancel this held order?"
        description="The hold will be cancelled. This does not create a bill."
        confirmLabel="Cancel hold"
        loading={pos.mutations.cancel.isPending}
        onConfirm={() => void pos.confirmCancelHold()}
      />
    </>
  );
}
