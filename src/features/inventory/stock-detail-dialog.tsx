"use client";

import { useState } from "react";
import { Warehouse } from "lucide-react";
import { formatDateTime } from "@/lib/date";
import { formatQuantity } from "@/lib/formatters";
import { getErrorMessage } from "@/types/api";
import { useProductQuery } from "@/features/products/use-products";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { LoadingState } from "@/components/shared/loading-state";
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
import type { StockMovement } from "@/types/inventory";
import { StockStatusBadge } from "./stock-status-badge";
import { useStockMovementsQuery } from "./use-inventory";
import { formatMovementType } from "./movement-labels";

type StockDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string | null;
};

const movementColumns: DataTableColumn<StockMovement>[] = [
  {
    accessorKey: "createdAt",
    header: "When",
    cell: ({ row }) => formatDateTime(row.original.createdAt),
  },
  {
    accessorKey: "movementType",
    header: "Type",
    cell: ({ row }) => formatMovementType(row.original.movementType),
  },
  {
    accessorKey: "quantity",
    header: "Qty",
    cell: ({ row }) => formatQuantity(row.original.quantity),
  },
  {
    accessorKey: "previousStock",
    header: "From",
    cell: ({ row }) => formatQuantity(row.original.previousStock),
  },
  {
    accessorKey: "newStock",
    header: "To",
    cell: ({ row }) => formatQuantity(row.original.newStock),
  },
  {
    accessorKey: "reason",
    header: "Reason",
    cell: ({ row }) => row.original.reason || row.original.billNumber || "—",
  },
];

export function StockDetailDialog({
  open,
  onOpenChange,
  productId,
}: StockDetailDialogProps) {
  const [page, setPage] = useState(1);
  const [pageProductId, setPageProductId] = useState(productId);
  if (productId !== pageProductId) {
    setPageProductId(productId);
    setPage(1);
  }
  const productQuery = useProductQuery(open ? productId : null);
  const movementsQuery = useStockMovementsQuery(
    {
      productId: productId ?? undefined,
      page,
      pageSize: 10,
    },
    { enabled: open && Boolean(productId) },
  );

  const product = productQuery.data;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg" showCloseButton>
        <DialogHeader icon={Warehouse}>
          <DialogTitle>
            {product
              ? [product.name, product.size].filter(Boolean).join(" — ")
              : "Product stock"}
          </DialogTitle>
          <DialogDescription>
            Current quantity comes from the product record. Recent movements are the latest
            backend history for this product.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-4">
          {productQuery.isLoading ? (
            <LoadingState label="Loading product..." />
          ) : product ? (
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">SKU</p>
                <p className="font-medium">{product.sku || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Current stock</p>
                <p className="font-medium">
                  {formatQuantity(product.stockQuantity)}
                  {product.unit ? ` ${product.unit}` : ""}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Reorder level</p>
                <p className="font-medium">{formatQuantity(product.reorderLevel)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <StockStatusBadge
                  stockQuantity={product.stockQuantity}
                  reorderLevel={product.reorderLevel}
                />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Category</p>
                <p className="font-medium">{product.categoryName || "—"}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {getErrorMessage(productQuery.error) || "Unable to load this product."}
            </p>
          )}

          <div>
            <h3 className="mb-2 text-sm font-medium">Recent movements</h3>
            <DataTable
              columns={movementColumns}
              data={movementsQuery.data?.items ?? []}
              isLoading={movementsQuery.isLoading}
              isError={movementsQuery.isError}
              errorMessage={getErrorMessage(movementsQuery.error)}
              onRetry={() => void movementsQuery.refetch()}
              emptyTitle="No stock movements"
              emptyDescription="This product has no recorded movements yet."
              page={movementsQuery.data?.page ?? page}
              pageCount={Math.max(1, movementsQuery.data?.totalPages ?? 1)}
              onPageChange={setPage}
              pageSize={10}
            />
          </div>
        </DialogBody>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
