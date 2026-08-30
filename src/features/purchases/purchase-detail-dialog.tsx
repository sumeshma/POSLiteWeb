"use client";

import { ClipboardList } from "lucide-react";
import { ViewDialog } from "@/components/shared/view-dialog";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { formatCurrency } from "@/lib/currency";
import { formatDateTime } from "@/lib/date";
import { getErrorMessage } from "@/types/api";
import { usePurchaseQuery } from "./use-purchases";

type PurchaseDetailDialogProps = {
  purchaseId: string | null;
  onOpenChange: (open: boolean) => void;
};

export function PurchaseDetailDialog({ purchaseId, onOpenChange }: PurchaseDetailDialogProps) {
  const open = Boolean(purchaseId);
  const detailQuery = usePurchaseQuery(open ? purchaseId : null);
  const purchase = detailQuery.data;
  const items = purchase?.items ?? [];

  return (
    <ViewDialog
      open={open}
      onOpenChange={onOpenChange}
      title={purchase?.purchaseNumber || "Purchase details"}
      description="Purchase details as returned by the server. Update and cancel are not supported."
      icon={ClipboardList}
      size="lg"
    >
      {detailQuery.isLoading ? (
        <LoadingState label="Loading purchase details..." />
      ) : detailQuery.isError ? (
        <ErrorState
          title="Unable to load purchase details"
          description={getErrorMessage(detailQuery.error)}
          onRetry={() => void detailQuery.refetch()}
        />
      ) : purchase ? (
        <div className="space-y-4">
          <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Supplier</dt>
              <dd className="font-medium">{purchase.supplierName || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Date</dt>
              <dd>{formatDateTime(purchase.purchaseDate) || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Recorded by</dt>
              <dd>{purchase.createdBy || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Notes</dt>
              <dd>{purchase.notes || "—"}</dd>
            </div>
          </dl>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left">
                <tr>
                  <th className="px-3 py-2 font-medium">Product</th>
                  <th className="px-3 py-2 font-medium">SKU</th>
                  <th className="px-3 py-2 font-medium">Qty</th>
                  <th className="px-3 py-2 font-medium">Unit cost</th>
                  <th className="px-3 py-2 font-medium">Line total</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td className="px-3 py-3 text-muted-foreground" colSpan={5}>
                      No line items returned.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={`${item.productId}-${item.sku ?? ""}`} className="border-t">
                      <td className="px-3 py-2">
                        {item.productName || "Product"}
                        {item.unit ? (
                          <span className="block text-xs text-muted-foreground">{item.unit}</span>
                        ) : null}
                      </td>
                      <td className="px-3 py-2">{item.sku || "—"}</td>
                      <td className="px-3 py-2 tabular-nums">{item.quantity}</td>
                      <td className="px-3 py-2 tabular-nums">{formatCurrency(item.unitCost)}</td>
                      <td className="px-3 py-2 tabular-nums">{formatCurrency(item.lineTotal)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="tabular-nums">{formatCurrency(purchase.subTotal)}</dd>
            </div>
            <div className="flex justify-between font-semibold">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatCurrency(purchase.totalAmount)}</dd>
            </div>
          </dl>
        </div>
      ) : null}
    </ViewDialog>
  );
}
