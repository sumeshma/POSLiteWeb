"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  AlertTriangle,
  ClipboardList,
  FileBarChart,
  PackagePlus,
  PauseCircle,
  Receipt,
  ShoppingCart,
  Wallet,
  Warehouse,
} from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { buttonVariants } from "@/components/ui/button";
import { permissions } from "@/config/permissions";
import { useAuth } from "@/components/auth/auth-provider";
import { useActiveHoldCountQuery } from "@/features/pos/use-pos";
import { useInventoryDashboardQuery } from "@/features/inventory/use-inventory";
import { useExpensesQuery } from "@/features/expenses/use-expenses";
import { usePurchasesQuery } from "@/features/purchases/use-purchases";
import { formatDate, formatDateTime } from "@/lib/date";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/types/api";
import { monthLabel } from "./period";
import { formatKpiCurrency, formatKpiNumber, KpiCard } from "./kpi-card";
import { DashboardCharts } from "./dashboard-charts";
import { SalesCharts, type TrendPoint } from "./sales-charts";
import {
  useDailySalesQuery,
  useMonthlySalesQuery,
  useYearlySalesQuery,
} from "@/features/reports/use-reports";
import { useOrdersQuery } from "@/features/reports/use-orders";
import { useReportPeriod } from "@/features/reports/use-report-period";
import { ReportPeriodToolbar } from "@/features/reports/report-period-toolbar";
import { getOrderTypeBreakdown, getPaymentBreakdown } from "@/features/reports/report-breakdowns";

export function DashboardPage() {
  const { can } = useAuth();
  const { period, setPeriod, resolved } = useReportPeriod("today");
  const canReports = can(permissions.reports);
  const canMonthly = can(permissions.reportsMonthly);
  const canProfit = can(permissions.reportsProfit);
  const canInventory = can(permissions.inventory);
  const canPos = can(permissions.pos);
  const canOrders = can(permissions.orders);
  const canPurchases = can(permissions.purchases);
  const canExpenses = can(permissions.expenses);
  const canOpenReports =
    canReports || canMonthly || canProfit || can(permissions.reportsTax) || canOrders;

  const salesEnabled = canReports && (resolved.kind === "daily" || canMonthly);
  const now = new Date();
  const chartYear = resolved.year ?? now.getFullYear();
  const chartMonth = resolved.month ?? now.getMonth() + 1;
  const dailySales = useDailySalesQuery(resolved.date, {
    enabled: salesEnabled && resolved.kind === "daily",
  });
  const monthlySales = useMonthlySalesQuery(chartYear, chartMonth, {
    enabled: salesEnabled && canMonthly,
  });
  const yearlySales = useYearlySalesQuery(chartYear, {
    enabled: salesEnabled && canMonthly,
  });

  const inventoryQuery = useInventoryDashboardQuery({ enabled: canInventory });
  const holdQuery = useActiveHoldCountQuery({ enabled: canPos });
  const recentOrders = useOrdersQuery({ page: 1, pageSize: 5 }, { enabled: canOrders });
  const recentPurchases = usePurchasesQuery({ page: 1, pageSize: 5 }, { enabled: canPurchases });
  const recentExpenses = useExpensesQuery({ page: 1, pageSize: 5 }, { enabled: canExpenses });

  const salesQuery =
    resolved.kind === "daily" ? dailySales : resolved.kind === "monthly" ? monthlySales : yearlySales;

  const periodTrend: TrendPoint[] = useMemo(() => {
    if (resolved.kind === "daily") {
      const byHour = new Map(
        (dailySales.data?.hourlyBreakdown ?? []).map((row) => [row.hour, row] as const),
      );
      return Array.from({ length: 24 }, (_, hour) => {
        const row = byHour.get(hour);
        return {
          label: `${String(hour).padStart(2, "0")}:00`,
          totalSales: row?.totalSales ?? 0,
          orderCount: row?.orderCount ?? 0,
        };
      });
    }
    if (resolved.kind === "monthly") {
      return (monthlySales.data?.dailyBreakdown ?? []).map((row) => ({
        label: formatDate(row.date) || row.date,
        totalSales: row.totalSales,
        orderCount: row.orderCount,
      }));
    }
    return (yearlySales.data?.monthlyBreakdown ?? []).map((row) => ({
      label: monthLabel(row.month),
      totalSales: row.totalSales,
      orderCount: row.orderCount,
    }));
  }, [dailySales.data, monthlySales.data, yearlySales.data, resolved.kind]);

  const monthTrend: TrendPoint[] = useMemo(
    () =>
      (monthlySales.data?.dailyBreakdown ?? []).map((row) => ({
        label: formatDate(row.date) || row.date,
        totalSales: row.totalSales,
        orderCount: row.orderCount,
      })),
    [monthlySales.data],
  );

  const yearTrend: TrendPoint[] = useMemo(
    () =>
      (yearlySales.data?.monthlyBreakdown ?? []).map((row) => ({
        label: monthLabel(row.month),
        totalSales: row.totalSales,
        orderCount: row.orderCount,
      })),
    [yearlySales.data],
  );

  const periodHasSales = periodTrend.some((row) => row.totalSales > 0 || row.orderCount > 0);
  const chartSource = periodHasSales
    ? "period"
    : monthTrend.some((row) => row.totalSales > 0 || row.orderCount > 0)
      ? "month"
      : yearTrend.some((row) => row.totalSales > 0 || row.orderCount > 0)
        ? "year"
        : "period";
  const trend = chartSource === "month" ? monthTrend : chartSource === "year" ? yearTrend : periodTrend;
  const chartSalesData =
    chartSource === "month"
      ? monthlySales.data
      : chartSource === "year"
        ? yearlySales.data
        : salesQuery.data;
  const trendTitle =
    chartSource === "month"
      ? "Daily sales"
      : chartSource === "year"
        ? "Monthly sales"
        : resolved.kind === "daily"
          ? "Hourly sales"
          : resolved.kind === "monthly"
            ? "Daily sales"
            : "Monthly sales";
  const trendHint =
    chartSource === "month" && !periodHasSales
      ? `No sales in ${resolved.label}. Showing this month.`
      : chartSource === "year" && !periodHasSales
        ? `No sales in ${resolved.label}. Showing this year.`
        : undefined;

  const totalSales = salesQuery.data?.totalSales ?? 0;
  const totalOrders = salesQuery.data?.totalOrders ?? 0;
  const payments = getPaymentBreakdown(chartSalesData);
  const orderTypes = getOrderTypeBreakdown(chartSalesData);
  const stockHealth = inventoryQuery.data
    ? [
        {
          name: "Healthy",
          value: Math.max(
            0,
            inventoryQuery.data.totalProducts -
              inventoryQuery.data.lowStockCount -
              inventoryQuery.data.outOfStockCount,
          ),
          color: "var(--chart-2)",
        },
        {
          name: "Low stock",
          value: inventoryQuery.data.lowStockCount,
          color: "var(--chart-5)",
        },
        {
          name: "Out of stock",
          value: inventoryQuery.data.outOfStockCount,
          color: "var(--destructive)",
        },
      ]
    : [];

  return (
    <PageContainer card={false}>
      <PageHeader
        title="Dashboard"
        description={`Shop overview for ${resolved.label}. Figures come from backend report and inventory summaries.`}
        actions={
          <ReportPeriodToolbar
            period={period}
            onPeriodChange={setPeriod}
            allowMonthly={canMonthly}
          />
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Sales"
          value={salesEnabled ? formatKpiCurrency(totalSales) : "—"}
          hint={salesEnabled ? resolved.label : "Requires sales reports access"}
          icon={ShoppingCart}
          tone="primary"
        />
        <KpiCard
          label="Bills"
          value={salesEnabled ? formatKpiNumber(totalOrders) : "—"}
          hint="Completed orders in this period"
          icon={Receipt}
          tone="secondary"
        />
        <KpiCard
          label="Held orders"
          value={canPos ? formatKpiNumber(holdQuery.data ?? 0) : "—"}
          hint="Active holds"
          icon={PauseCircle}
          tone="warning"
        />
        <KpiCard
          label="Stock alerts"
          value={
            canInventory
              ? formatKpiNumber(
                  (inventoryQuery.data?.lowStockCount ?? 0) +
                    (inventoryQuery.data?.outOfStockCount ?? 0),
                )
              : "—"
          }
          hint={
            canInventory
              ? `${inventoryQuery.data?.lowStockCount ?? 0} low · ${inventoryQuery.data?.outOfStockCount ?? 0} out`
              : "Requires inventory access"
          }
          icon={AlertTriangle}
          tone="destructive"
        />
      </div>

      {salesEnabled ? (
        salesQuery.isLoading || (!periodHasSales && canMonthly && (monthlySales.isLoading || yearlySales.isLoading)) ? (
          <LoadingState label="Loading sales graph..." />
        ) : salesQuery.isError && monthlySales.isError ? (
          <ErrorState
            title="Unable to load sales graph"
            description={getErrorMessage(salesQuery.error ?? monthlySales.error)}
            onRetry={() => {
              void salesQuery.refetch();
              void monthlySales.refetch();
            }}
          />
        ) : (
          <SalesCharts
            trend={trend}
            trendTitle={trendTitle}
            trendHint={trendHint}
            payments={payments}
            orderTypes={orderTypes}
          />
        )
      ) : (
        <EmptyState
          title="Sales overview is not available"
          description="You do not have permission to view sales reports for this period."
        />
      )}

      <DashboardCharts
        stockHealth={canInventory && !inventoryQuery.isError ? stockHealth : []}
      />

      <div className="flex flex-wrap gap-2">
        {canPos ? (
          <Link href="/pos" className={cn(buttonVariants())}>
            <ShoppingCart />
            New sale
          </Link>
        ) : null}
        {canOpenReports ? (
          <Link href="/reports" className={cn(buttonVariants({ variant: "secondary" }))}>
            <FileBarChart />
            Reports
          </Link>
        ) : null}
        {can(permissions.productsManage) ? (
          <Link href="/products" className={cn(buttonVariants({ variant: "secondary" }))}>
            <PackagePlus />
            Products
          </Link>
        ) : null}
        {can(permissions.purchasesManage) ? (
          <Link href="/purchases/new" className={cn(buttonVariants({ variant: "secondary" }))}>
            <ClipboardList />
            Record purchase
          </Link>
        ) : null}
        {can(permissions.expensesManage) ? (
          <Link href="/expenses" className={cn(buttonVariants({ variant: "secondary" }))}>
            <Wallet />
            Expenses
          </Link>
        ) : null}
        {canInventory ? (
          <Link href="/inventory" className={cn(buttonVariants({ variant: "secondary" }))}>
            <Warehouse />
            Inventory
          </Link>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {canOrders ? (
          <section className="rounded-xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-sm font-medium">Recent bills</h2>
              <Link href="/reports/sales" className="text-sm text-secondary hover:underline">
                Sales report
              </Link>
            </div>
            {recentOrders.isLoading ? (
              <LoadingState className="py-6" label="Loading bills..." />
            ) : recentOrders.isError ? (
              <ErrorState
                className="py-6"
                title="Unable to load bills"
                description={getErrorMessage(recentOrders.error)}
                onRetry={() => void recentOrders.refetch()}
              />
            ) : (recentOrders.data?.items ?? []).length === 0 ? (
              <EmptyState className="py-6" title="No recent bills" />
            ) : (
              <ul className="space-y-2 text-sm">
                {(recentOrders.data?.items ?? []).map((order) => (
                  <li
                    key={order.id}
                    className="flex items-center justify-between gap-2 border-b border-border py-2 last:border-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{order.billNumber || "Bill"}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(order.createdAt)} · {order.paymentMethod || "—"}
                      </p>
                    </div>
                    <p className="shrink-0 tabular-nums">{formatCurrency(order.totalAmount)}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : null}

        {canInventory ? (
          <section className="rounded-xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-sm font-medium">Low stock</h2>
              <Link href="/inventory" className="text-sm text-secondary hover:underline">
                Inventory
              </Link>
            </div>
            {inventoryQuery.isLoading ? (
              <LoadingState className="py-6" label="Loading stock..." />
            ) : inventoryQuery.isError ? (
              <ErrorState
                className="py-6"
                title="Unable to load inventory"
                description={getErrorMessage(inventoryQuery.error)}
                onRetry={() => void inventoryQuery.refetch()}
              />
            ) : (inventoryQuery.data?.lowStockProducts ?? []).length === 0 ? (
              <EmptyState className="py-6" title="No low-stock items" />
            ) : (
              <ul className="space-y-2 text-sm">
                {(inventoryQuery.data?.lowStockProducts ?? []).slice(0, 6).map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-2 border-b border-border py-2 last:border-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{item.name || "Product"}</p>
                      <p className="text-xs text-muted-foreground">{item.sku || "No SKU"}</p>
                    </div>
                    <span className="flex items-center gap-1 text-destructive">
                      <AlertTriangle className="size-3.5" aria-hidden="true" />
                      <span className="tabular-nums">{item.stockQuantity}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : null}

        {canPurchases ? (
          <section className="rounded-xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-sm font-medium">Recent purchases</h2>
              <Link href="/purchases" className="text-sm text-secondary hover:underline">
                Purchases
              </Link>
            </div>
            {recentPurchases.isLoading ? (
              <LoadingState className="py-6" label="Loading purchases..." />
            ) : recentPurchases.isError ? (
              <ErrorState
                className="py-6"
                title="Unable to load purchases"
                description={getErrorMessage(recentPurchases.error)}
                onRetry={() => void recentPurchases.refetch()}
              />
            ) : (recentPurchases.data?.items ?? []).length === 0 ? (
              <EmptyState className="py-6" title="No recent purchases" />
            ) : (
              <ul className="space-y-2 text-sm">
                {(recentPurchases.data?.items ?? []).map((item) => (
                  <li
                    key={item.id}
                    className="flex justify-between gap-2 border-b border-border py-2 last:border-0"
                  >
                    <span className="truncate">{item.purchaseNumber || "Purchase"}</span>
                    <span className="tabular-nums">{formatCurrency(item.totalAmount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : null}

        {canExpenses ? (
          <section className="rounded-xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-sm font-medium">Recent expenses</h2>
              <Link href="/expenses" className="text-sm text-secondary hover:underline">
                Expenses
              </Link>
            </div>
            {recentExpenses.isLoading ? (
              <LoadingState className="py-6" label="Loading expenses..." />
            ) : recentExpenses.isError ? (
              <ErrorState
                className="py-6"
                title="Unable to load expenses"
                description={getErrorMessage(recentExpenses.error)}
                onRetry={() => void recentExpenses.refetch()}
              />
            ) : (recentExpenses.data?.items ?? []).length === 0 ? (
              <EmptyState className="py-6" title="No recent expenses" />
            ) : (
              <ul className="space-y-2 text-sm">
                {(recentExpenses.data?.items ?? []).map((item) => (
                  <li
                    key={item.id}
                    className="flex justify-between gap-2 border-b border-border py-2 last:border-0"
                  >
                    <span className="truncate">{item.title || item.category || "Expense"}</span>
                    <span className="tabular-nums">{formatCurrency(item.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : null}
      </div>
    </PageContainer>
  );
}
