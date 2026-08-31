"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Eye, Plus } from "lucide-react";
import { RequirePermission } from "@/components/auth/require-permission";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { DataTableActions } from "@/components/shared/data-table-actions";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { permissions } from "@/config/permissions";
import { useSuppliersQuery } from "@/features/suppliers/use-suppliers";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { usePermission } from "@/hooks/use-permission";
import { formatCurrency } from "@/lib/currency";
import { formatDateTime } from "@/lib/date";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/types/api";
import type { Purchase } from "@/types/purchase";
import { PurchaseDetailDialog } from "./purchase-detail-dialog";
import { usePurchasesQuery } from "./use-purchases";

const PAGE_SIZE = 20;

export function PurchasesPage() {
  const canManage = usePermission(permissions.purchasesManage);
  const [search, setSearch] = useState("");
  const [supplierId, setSupplierId] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [detailId, setDetailId] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(search);
  const suppliersQuery = useSuppliersQuery({ isActive: true });

  const listQuery = usePurchasesQuery({
    search: debouncedSearch || undefined,
    supplierId: supplierId === "all" ? undefined : supplierId,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
    page,
    pageSize: PAGE_SIZE,
  });
  const pageResult = listQuery.data;
  const items = pageResult?.items ?? [];

  const columns = useMemo<DataTableColumn<Purchase>[]>(
    () => [
      {
        accessorKey: "purchaseNumber",
        header: "Purchase no.",
        cell: ({ row }) => (
          <button
            type="button"
            className="font-medium text-primary hover:underline"
            onClick={() => setDetailId(row.original.id)}
          >
            {row.original.purchaseNumber || "—"}
          </button>
        ),
      },
      {
        accessorKey: "supplierName",
        header: "Supplier",
        cell: ({ row }) => row.original.supplierName || "—",
      },
      {
        accessorKey: "purchaseDate",
        header: "Date",
        cell: ({ row }) => formatDateTime(row.original.purchaseDate) || "—",
      },
      {
        accessorKey: "totalAmount",
        header: "Total",
        cell: ({ row }) => (
          <span className="tabular-nums">{formatCurrency(row.original.totalAmount)}</span>
        ),
      },
      {
        accessorKey: "createdBy",
        header: "Recorded by",
        cell: ({ row }) => row.original.createdBy || "—",
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <DataTableActions
            actions={[
              {
                label: "View details",
                icon: Eye,
                onClick: () => setDetailId(row.original.id),
              },
            ]}
          />
        ),
      },
    ],
    [],
  );

  return (
    <RequirePermission permission={permissions.purchases}>
      <PageContainer>
        <PageHeader
          title="Purchases"
          description="Purchase history recorded against suppliers. Totals come from the server."
          actions={
            canManage ? (
              <Link href="/purchases/new" className={cn(buttonVariants())}>
                <Plus />
                Record purchase
              </Link>
            ) : null
          }
        />

        <div className="space-y-4">
            <ListToolbar
              search={search}
              onSearchChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
              searchPlaceholder="Search purchases"
              filters={
                <>
                  <Select
                    value={supplierId}
                    onValueChange={(value) => {
                      setSupplierId(value ?? "all");
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-44">
                      <SelectValue placeholder="Supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All suppliers</SelectItem>
                      {(suppliersQuery.data ?? []).map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name || "Supplier"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="date"
                    value={fromDate}
                    aria-label="From date"
                    className="w-36"
                    onChange={(event) => {
                      setFromDate(event.target.value);
                      setPage(1);
                    }}
                  />
                  <Input
                    type="date"
                    value={toDate}
                    aria-label="To date"
                    className="w-36"
                    onChange={(event) => {
                      setToDate(event.target.value);
                      setPage(1);
                    }}
                  />
                </>
              }
            />
            <div className="overflow-x-auto">
              <DataTable
                columns={columns}
                data={items}
                isLoading={listQuery.isLoading}
                isError={listQuery.isError}
                errorMessage={getErrorMessage(listQuery.error)}
                onRetry={() => void listQuery.refetch()}
                emptyTitle="No purchases found"
                emptyDescription="Record a purchase, or try a different search or date range."
                page={pageResult?.page ?? page}
                pageCount={Math.max(1, pageResult?.totalPages ?? 1)}
                onPageChange={setPage}
              />
            </div>
        </div>

        <PurchaseDetailDialog
          purchaseId={detailId}
          onOpenChange={(open) => {
            if (!open) {
              setDetailId(null);
            }
          }}
        />
      </PageContainer>
    </RequirePermission>
  );
}
