"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { RequirePermission } from "@/components/auth/require-permission";
import { PageContainer } from "@/components/layout/page-container";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { ErrorState } from "@/components/shared/error-state";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { LoadingState } from "@/components/shared/loading-state";
import { buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { permissions } from "@/config/permissions";
import { useAuth } from "@/components/auth/auth-provider";
import { KpiCard, formatKpiCurrency } from "@/features/dashboard/kpi-card";
import { PurchaseDetailDialog } from "@/features/purchases/purchase-detail-dialog";
import { usePurchasesQuery } from "@/features/purchases/use-purchases";
import { useSuppliersQuery } from "@/features/suppliers/use-suppliers";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { formatCurrency } from "@/lib/currency";
import { formatDateTime } from "@/lib/date";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/types/api";
import type { Purchase } from "@/types/purchase";
import { ReportPageHeader } from "./report-page-header";
import { ReportPeriodToolbar } from "./report-period-toolbar";
import { useReportPeriod } from "./use-report-period";
import {
  useDailyProfitLossQuery,
  useMonthlyProfitLossQuery,
  useYearlyProfitLossQuery,
} from "./use-reports";

const PAGE_SIZE = 20;

export function PurchasesReportPage() {
  const { can } = useAuth();
  const canMonthly = can(permissions.reportsMonthly);
  const canProfit = can(permissions.reportsProfit);
  const { period, setPeriod, dailyDate, setDailyDate, resolved } = useReportPeriod("month");
  const [search, setSearch] = useState("");
  const [supplierId, setSupplierId] = useState("all");
  const [page, setPage] = useState(1);
  const [detailId, setDetailId] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(search);
  const suppliersQuery = useSuppliersQuery({ isActive: true });
  const listQuery = usePurchasesQuery({
    search: debouncedSearch || undefined,
    supplierId: supplierId === "all" ? undefined : supplierId,
    fromDate: resolved.fromDate,
    toDate: resolved.toDate,
    page,
    pageSize: PAGE_SIZE,
  });
  const plEnabled = canProfit && (resolved.kind === "daily" || canMonthly);
  const dailyPl = useDailyProfitLossQuery(resolved.date, {
    enabled: plEnabled && resolved.kind === "daily",
  });
  const monthlyPl = useMonthlyProfitLossQuery(resolved.year, resolved.month, {
    enabled: plEnabled && resolved.kind === "monthly",
  });
  const yearlyPl = useYearlyProfitLossQuery(resolved.year, {
    enabled: plEnabled && resolved.kind === "yearly",
  });
  const plQuery = resolved.kind === "daily" ? dailyPl : resolved.kind === "monthly" ? monthlyPl : yearlyPl;

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
        header: "Amount",
        cell: ({ row }) => (
          <span className="tabular-nums">{formatCurrency(row.original.totalAmount)}</span>
        ),
      },
      {
        accessorKey: "createdBy",
        header: "Recorded by",
        cell: ({ row }) => row.original.createdBy || "—",
      },
    ],
    [],
  );

  return (
    <RequirePermission permission={permissions.purchases}>
      <PageContainer>
        <ReportPageHeader
          title="Purchase report"
          description={`Purchase records for ${resolved.label}. Period purchase totals come from profit-and-loss when you have access, not from summing this page.`}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <ReportPeriodToolbar
                period={period}
                onPeriodChange={(value) => {
                  setPeriod(value);
                  setPage(1);
                }}
                dailyDate={dailyDate || resolved.date}
                onDailyDateChange={(value) => {
                  setDailyDate(value);
                  setPage(1);
                }}
                showDailyDate
              />
              <Link href="/purchases" className={cn(buttonVariants({ variant: "outline" }))}>
                Open purchases
              </Link>
            </div>
          }
        />

        {plEnabled ? (
          plQuery.isLoading ? (
            <LoadingState label="Loading purchase totals..." />
          ) : plQuery.isError ? (
            <ErrorState
              title="Unable to load purchase totals"
              description={getErrorMessage(plQuery.error)}
              onRetry={() => void plQuery.refetch()}
            />
          ) : plQuery.data ? (
            <KpiCard
              label="Purchase total"
              value={formatKpiCurrency(plQuery.data.purchases)}
              tone="secondary"
            />
          ) : null
        ) : null}

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
                    <SelectTrigger className="w-44" aria-label="Supplier">
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
                </>
              }
            />
            <div className="overflow-x-auto">
              <DataTable
                columns={columns}
                data={listQuery.data?.items ?? []}
                isLoading={listQuery.isLoading}
                isError={listQuery.isError}
                errorMessage={getErrorMessage(listQuery.error)}
                onRetry={() => void listQuery.refetch()}
                emptyTitle="No purchases in this period"
                emptyDescription="Try a different date range, supplier, or search."
                page={listQuery.data?.page ?? page}
                pageCount={Math.max(1, listQuery.data?.totalPages ?? 1)}
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
