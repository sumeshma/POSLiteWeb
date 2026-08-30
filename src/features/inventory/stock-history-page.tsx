"use client";

import { useMemo, useState } from "react";
import { Warehouse } from "lucide-react";
import { RequirePermission } from "@/components/auth/require-permission";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { DataTableActions } from "@/components/shared/data-table-actions";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { permissions } from "@/config/permissions";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { formatDateTime } from "@/lib/date";
import { formatQuantity } from "@/lib/formatters";
import { getErrorMessage } from "@/types/api";
import type { StockMovement } from "@/types/inventory";
import { MOVEMENT_TYPES } from "@/types/inventory";
import {
  formatMovementReference,
  formatMovementType,
} from "./movement-labels";
import { StockDetailDialog } from "./stock-detail-dialog";
import { useStockMovementsQuery } from "./use-inventory";

const PAGE_SIZE = 20;

export function StockHistoryPage() {
  const [search, setSearch] = useState("");
  const [movementType, setMovementType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [detailProductId, setDetailProductId] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(search);

  const listQuery = useStockMovementsQuery({
    search: debouncedSearch || undefined,
    movementType: movementType || undefined,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
    page,
    pageSize: PAGE_SIZE,
  });
  const pageResult = listQuery.data;
  const items = pageResult?.items ?? [];

  const columns = useMemo<DataTableColumn<StockMovement>[]>(
    () => [
      {
        accessorKey: "createdAt",
        header: "When",
        cell: ({ row }) => formatDateTime(row.original.createdAt),
      },
      {
        accessorKey: "productName",
        header: "Product",
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.productName || "—"}</p>
            <p className="text-xs text-muted-foreground">{row.original.sku || "No SKU"}</p>
          </div>
        ),
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
        id: "reference",
        header: "Reference",
        cell: ({ row }) => formatMovementReference(row.original),
      },
      {
        accessorKey: "userName",
        header: "User",
        cell: ({ row }) => row.original.userName || "—",
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <DataTableActions
            actions={[
              {
                label: "View product stock",
                icon: Warehouse,
                onClick: () => setDetailProductId(row.original.productId),
              },
            ]}
          />
        ),
      },
    ],
    [],
  );

  return (
    <RequirePermission permission={permissions.inventory}>
      <PageContainer>
        <PageHeader
          title="Stock history"
          description="Stock movements recorded by the backend, including sales, purchases, and manual adjustments."
        />

        <div className="space-y-4">
            <ListToolbar
              search={search}
              onSearchChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
              searchPlaceholder="Search movements"
              filters={
                <>
                  <Select
                    value={movementType || "__all__"}
                    onValueChange={(value) => {
                      setMovementType(value === "__all__" || value == null ? "" : value);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-44">
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">All types</SelectItem>
                      {MOVEMENT_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {formatMovementType(type)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="movement-from" className="text-xs text-muted-foreground">
                      From
                    </Label>
                    <Input
                      id="movement-from"
                      type="date"
                      value={fromDate}
                      onChange={(event) => {
                        setFromDate(event.target.value);
                        setPage(1);
                      }}
                      className="w-36"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="movement-to" className="text-xs text-muted-foreground">
                      To
                    </Label>
                    <Input
                      id="movement-to"
                      type="date"
                      value={toDate}
                      onChange={(event) => {
                        setToDate(event.target.value);
                        setPage(1);
                      }}
                      className="w-36"
                    />
                  </div>
                </>
              }
            />
            <DataTable
              columns={columns}
              data={items}
              isLoading={listQuery.isLoading}
              isError={listQuery.isError}
              errorMessage={getErrorMessage(listQuery.error)}
              onRetry={() => void listQuery.refetch()}
              emptyTitle="No stock movements"
              emptyDescription={
                search || movementType || fromDate || toDate
                  ? "No movements match the current search or filters."
                  : "Stock movements will appear here after sales, purchases, or adjustments."
              }
              page={pageResult?.page ?? page}
              pageCount={Math.max(1, pageResult?.totalPages ?? 1)}
              onPageChange={setPage}
            />
        </div>

        <StockDetailDialog
          open={Boolean(detailProductId)}
          onOpenChange={(open) => {
            if (!open) {
              setDetailProductId(null);
            }
          }}
          productId={detailProductId}
        />
      </PageContainer>
    </RequirePermission>
  );
}
