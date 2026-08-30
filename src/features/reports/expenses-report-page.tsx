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
import { ExpenseDetailDialog } from "@/features/expenses/expense-detail-dialog";
import {
  useExpenseCategoriesQuery,
  useExpensesQuery,
} from "@/features/expenses/use-expenses";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/date";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/types/api";
import type { Expense } from "@/types/expense";
import { ProfitLossCharts } from "./profit-loss-charts";
import { getExpenseCategoryBreakdown } from "./report-breakdowns";
import { ReportPageHeader } from "./report-page-header";
import { ReportPeriodToolbar } from "./report-period-toolbar";
import { useReportPeriod } from "./use-report-period";
import {
  useDailyProfitLossQuery,
  useMonthlyProfitLossQuery,
  useYearlyProfitLossQuery,
} from "./use-reports";

const PAGE_SIZE = 20;

export function ExpensesReportPage() {
  const { can } = useAuth();
  const canMonthly = can(permissions.reportsMonthly);
  const canProfit = can(permissions.reportsProfit);
  const { period, setPeriod, dailyDate, setDailyDate, resolved } = useReportPeriod("month");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [detailId, setDetailId] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(search);
  const categoriesQuery = useExpenseCategoriesQuery();
  const listQuery = useExpensesQuery({
    search: debouncedSearch || undefined,
    category: category === "all" ? undefined : category,
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
  const expenseBreakdown = getExpenseCategoryBreakdown(plQuery.data);

  const columns = useMemo<DataTableColumn<Expense>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => (
          <button
            type="button"
            className="font-medium text-primary hover:underline"
            onClick={() => setDetailId(row.original.id)}
          >
            {row.original.title || "—"}
          </button>
        ),
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => row.original.category || "—",
      },
      {
        accessorKey: "expenseDate",
        header: "Date",
        cell: ({ row }) => formatDate(row.original.expenseDate) || "—",
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => (
          <span className="tabular-nums">{formatCurrency(row.original.amount)}</span>
        ),
      },
      {
        accessorKey: "createdByName",
        header: "Recorded by",
        cell: ({ row }) => row.original.createdByName || "—",
      },
    ],
    [],
  );

  return (
    <RequirePermission permission={permissions.expenses}>
      <PageContainer>
        <ReportPageHeader
          title="Expense report"
          description={`Expense records for ${resolved.label}. Category totals come from profit-and-loss when available, not from this paged list.`}
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
              <Link href="/expenses" className={cn(buttonVariants({ variant: "outline" }))}>
                Open expenses
              </Link>
            </div>
          }
        />

        {plEnabled ? (
          plQuery.isLoading ? (
            <LoadingState label="Loading expense totals..." />
          ) : plQuery.isError ? (
            <ErrorState
              title="Unable to load expense totals"
              description={getErrorMessage(plQuery.error)}
              onRetry={() => void plQuery.refetch()}
            />
          ) : plQuery.data ? (
            <>
              <KpiCard
                label="Expense total"
                value={formatKpiCurrency(plQuery.data.expenses)}
                tone="warning"
              />
              <ProfitLossCharts dailyBreakdown={[]} expenseBreakdown={expenseBreakdown} />
            </>
          ) : null
        ) : null}

        <div className="space-y-4">
            <ListToolbar
              search={search}
              onSearchChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
              searchPlaceholder="Search expenses"
              filters={
                <Select
                  value={category}
                  onValueChange={(value) => {
                    setCategory(value ?? "all");
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-44" aria-label="Category">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {(categoriesQuery.data ?? []).map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                emptyTitle="No expenses in this period"
                emptyDescription="Try a different date range, category, or search."
                page={listQuery.data?.page ?? page}
                pageCount={Math.max(1, listQuery.data?.totalPages ?? 1)}
                onPageChange={setPage}
              />
            </div>
        </div>

        <ExpenseDetailDialog
          expenseId={detailId}
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
