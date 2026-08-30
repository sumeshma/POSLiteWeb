"use client";

import { useMemo, useState } from "react";
import { RequirePermission } from "@/components/auth/require-permission";
import { PageContainer } from "@/components/layout/page-container";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { LoadingState } from "@/components/shared/loading-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { permissions } from "@/config/permissions";
import { useAuth } from "@/components/auth/auth-provider";
import { KpiCard, formatKpiCurrency, formatKpiNumber } from "@/features/dashboard/kpi-card";
import { SalesCharts, type TrendPoint } from "@/features/dashboard/sales-charts";
import { monthLabel } from "@/features/dashboard/period";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { formatDate, formatDateTime } from "@/lib/date";
import { formatCurrency } from "@/lib/currency";
import { getErrorMessage } from "@/types/api";
import { ORDER_TYPES, PAYMENT_METHODS } from "@/types/billing";
import type { OrderSummary } from "@/types/order";
import { getOrderTypeBreakdown, getPaymentBreakdown } from "./report-breakdowns";
import { ReportPageHeader } from "./report-page-header";
import { ReportPeriodToolbar } from "./report-period-toolbar";
import { useOrdersQuery } from "./use-orders";
import { useReportPeriod } from "./use-report-period";
import {
  useDailySalesQuery,
  useMonthlySalesQuery,
  useYearlySalesQuery,
} from "./use-reports";

const PAGE_SIZE = 20;

export function SalesReportPage() {
  const { can } = useAuth();
  const canReports = can(permissions.reports);
  const canMonthly = can(permissions.reportsMonthly);
  const { period, setPeriod, dailyDate, setDailyDate, resolved } = useReportPeriod(
    canMonthly ? "month" : "today",
  );
  const canOrders = can(permissions.orders);
  const [search, setSearch] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("all");
  const [orderType, setOrderType] = useState("all");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search);

  const salesEnabled = canReports && (resolved.kind === "daily" || canMonthly);
  const dailySales = useDailySalesQuery(resolved.date, {
    enabled: salesEnabled && resolved.kind === "daily",
  });
  const monthlySales = useMonthlySalesQuery(resolved.year, resolved.month, {
    enabled: salesEnabled && resolved.kind === "monthly",
  });
  const yearlySales = useYearlySalesQuery(resolved.year, {
    enabled: salesEnabled && resolved.kind === "yearly",
  });
  const salesQuery =
    resolved.kind === "daily" ? dailySales : resolved.kind === "monthly" ? monthlySales : yearlySales;

  const ordersQuery = useOrdersQuery(
    {
      search: debouncedSearch || undefined,
      fromDate: resolved.fromDate,
      toDate: resolved.toDate,
      paymentMethod: paymentMethod === "all" ? undefined : paymentMethod,
      orderType: orderType === "all" ? undefined : orderType,
      page,
      pageSize: PAGE_SIZE,
    },
    { enabled: canOrders },
  );

  const trend: TrendPoint[] = useMemo(() => {
    if (resolved.kind === "daily") {
      return (dailySales.data?.hourlyBreakdown ?? [])
        .filter((row) => row.orderCount > 0 || row.totalSales > 0)
        .map((row) => ({
          label: `${String(row.hour).padStart(2, "0")}:00`,
          totalSales: row.totalSales,
          orderCount: row.orderCount,
        }));
    }
    if (resolved.kind === "monthly") {
      return (monthlySales.data?.dailyBreakdown ?? []).map((row) => ({
        label: formatDate(row.date) || row.date,
        totalSales: row.totalSales,
        orderCount: row.orderCount,
      }));
    }
    return (yearlySales.data?.monthlyBreakdown ?? [])
      .filter((row) => row.orderCount > 0 || row.totalSales > 0)
      .map((row) => ({
        label: monthLabel(row.month),
        totalSales: row.totalSales,
        orderCount: row.orderCount,
      }));
  }, [dailySales.data, monthlySales.data, yearlySales.data, resolved.kind]);

  const columns = useMemo<DataTableColumn<OrderSummary>[]>(
    () => [
      {
        accessorKey: "billNumber",
        header: "Bill no.",
        cell: ({ row }) => row.original.billNumber || "—",
      },
      {
        accessorKey: "createdAt",
        header: "Date",
        cell: ({ row }) => formatDateTime(row.original.createdAt) || "—",
      },
      {
        accessorKey: "cashierName",
        header: "Cashier",
        cell: ({ row }) => row.original.cashierName || "—",
      },
      {
        accessorKey: "paymentMethod",
        header: "Payment",
        cell: ({ row }) => row.original.paymentMethod || "—",
      },
      {
        accessorKey: "orderType",
        header: "Type",
        cell: ({ row }) => row.original.orderType || "—",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => row.original.status || "—",
      },
      {
        accessorKey: "totalAmount",
        header: "Total",
        cell: ({ row }) => (
          <span className="tabular-nums">{formatCurrency(row.original.totalAmount)}</span>
        ),
      },
    ],
    [],
  );

  const payments = getPaymentBreakdown(salesQuery.data);
  const orderTypes = getOrderTypeBreakdown(salesQuery.data);

  return (
    <RequirePermission permission={permissions.reports}>
      <PageContainer>
        <ReportPageHeader
          title="Sales report"
          description={`Backend sales summary for ${resolved.label}. Bill rows are a separate paged orders list and are not used to invent totals.`}
          actions={
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
              allowMonthly={canMonthly}
            />
          }
        />

        {salesEnabled ? (
          salesQuery.isLoading ? (
            <LoadingState label="Loading sales summary..." />
          ) : salesQuery.isError ? (
            <ErrorState
              title="Unable to load sales summary"
              description={getErrorMessage(salesQuery.error)}
              onRetry={() => void salesQuery.refetch()}
            />
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-3">
                <KpiCard
                  label="Sales"
                  value={formatKpiCurrency(salesQuery.data?.totalSales ?? 0)}
                  tone="primary"
                />
                <KpiCard
                  label="Bills"
                  value={formatKpiNumber(salesQuery.data?.totalOrders ?? 0)}
                  tone="secondary"
                />
                <KpiCard
                  label="Average bill"
                  value={formatKpiCurrency(salesQuery.data?.averageOrderValue ?? 0)}
                  tone="primary"
                />
              </div>
              <SalesCharts
                trend={trend}
                trendTitle={
                  resolved.kind === "daily"
                    ? "Hourly sales"
                    : resolved.kind === "monthly"
                      ? "Daily sales"
                      : "Monthly sales"
                }
                payments={payments}
                orderTypes={orderTypes}
              />
            </>
          )
        ) : (
          <EmptyState
            title="This period is not available"
            description="Monthly and yearly sales summaries require monthly reports access."
          />
        )}

        {canOrders ? (
        <div className="space-y-4">
              <ListToolbar
                search={search}
                onSearchChange={(value) => {
                  setSearch(value);
                  setPage(1);
                }}
                searchPlaceholder="Search bills"
                filters={
                  <>
                    <Select
                      value={paymentMethod}
                      onValueChange={(value) => {
                        setPaymentMethod(value ?? "all");
                        setPage(1);
                      }}
                    >
                      <SelectTrigger className="w-36" aria-label="Payment method">
                        <SelectValue placeholder="Payment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All payments</SelectItem>
                        {PAYMENT_METHODS.map((method) => (
                          <SelectItem key={method} value={method}>
                            {method === "Upi" ? "UPI" : method}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={orderType}
                      onValueChange={(value) => {
                        setOrderType(value ?? "all");
                        setPage(1);
                      }}
                    >
                      <SelectTrigger className="w-36" aria-label="Order type">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All types</SelectItem>
                        {ORDER_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
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
                  data={ordersQuery.data?.items ?? []}
                  isLoading={ordersQuery.isLoading}
                  isError={ordersQuery.isError}
                  errorMessage={getErrorMessage(ordersQuery.error)}
                  onRetry={() => void ordersQuery.refetch()}
                  emptyTitle="No bills in this period"
                  emptyDescription="Try a different date range, search, or filter."
                  page={ordersQuery.data?.page ?? page}
                  pageCount={Math.max(1, ordersQuery.data?.totalPages ?? 1)}
                  onPageChange={setPage}
                />
              </div>
        </div>
        ) : null}
      </PageContainer>
    </RequirePermission>
  );
}
