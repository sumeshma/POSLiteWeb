"use client";

import Link from "next/link";
import { useMemo, type ReactNode } from "react";
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
import { DashboardPanel, DashboardTable, DashboardTableRow } from "./dashboard-panel";
import { QuickAccessBar, type QuickAccessItem } from "./quick-access-bar";
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

  const quickAccessItems: QuickAccessItem[] = [
    canPos ? { href: "/pos", label: "New sale", icon: ShoppingCart } : null,
    canOpenReports ? { href: "/reports", label: "Reports", icon: FileBarChart } : null,
    can(permissions.productsManage)
      ? { href: "/products", label: "Products", icon: PackagePlus }
      : null,
    can(permissions.purchasesManage)
      ? { href: "/purchases/new", label: "Record purchase", icon: ClipboardList }
      : null,
    can(permissions.expensesManage)
      ? { href: "/expenses", label: "Expenses", icon: Wallet }
      : null,
    canInventory ? { href: "/inventory", label: "Inventory", icon: Warehouse } : null,
  ].filter((item): item is QuickAccessItem => item !== null);

  return (
    <PageContainer card={false}>
      <DashboardReveal delay={0}>
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
      </DashboardReveal>

      <DashboardReveal delay={60} className="grid grid-cols-4 gap-2 md:gap-3">
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
      </DashboardReveal>

      <DashboardReveal delay={120}>
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
      </DashboardReveal>

      <DashboardReveal delay={180}>
        <DashboardCharts
          stockHealth={canInventory && !inventoryQuery.isError ? stockHealth : []}
        />
      </DashboardReveal>

      <DashboardReveal delay={240}>
        <QuickAccessBar items={quickAccessItems} />
      </DashboardReveal>

      <DashboardReveal delay={300} className="grid gap-4 lg:grid-cols-2">
        {canOrders ? (
          <DashboardPanel title="Recent bills" href="/reports/sales" linkLabel="Sales report">
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
              <DashboardTable primaryLabel="Bill" valueLabel="Amount">
                {(recentOrders.data?.items ?? []).map((order) => (
                  <DashboardTableRow
                    key={order.id}
                    title={order.billNumber || "Bill"}
                    subtitle={`${formatDateTime(order.createdAt)} · ${order.paymentMethod || "—"}`}
                    value={formatCurrency(order.totalAmount)}
                  />
                ))}
              </DashboardTable>
            )}
          </DashboardPanel>
        ) : null}

        {canInventory ? (
          <DashboardPanel title="Low stock" href="/inventory" linkLabel="Inventory">
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
              <DashboardTable primaryLabel="Product" valueLabel="Qty">
                {(inventoryQuery.data?.lowStockProducts ?? []).slice(0, 6).map((item) => (
                  <DashboardTableRow
                    key={item.id}
                    title={item.name || "Product"}
                    subtitle={item.sku || "No SKU"}
                    tone="danger"
                    value={
                      <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs">
                        <AlertTriangle className="size-3.5" aria-hidden="true" />
                        {item.stockQuantity}
                      </span>
                    }
                  />
                ))}
              </DashboardTable>
            )}
          </DashboardPanel>
        ) : null}

        {canPurchases ? (
          <DashboardPanel title="Recent purchases" href="/purchases" linkLabel="Purchases">
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
              <DashboardTable primaryLabel="Purchase" valueLabel="Amount">
                {(recentPurchases.data?.items ?? []).map((item) => (
                  <DashboardTableRow
                    key={item.id}
                    title={item.purchaseNumber || "Purchase"}
                    value={formatCurrency(item.totalAmount)}
                  />
                ))}
              </DashboardTable>
            )}
          </DashboardPanel>
        ) : null}

        {canExpenses ? (
          <DashboardPanel title="Recent expenses" href="/expenses" linkLabel="Expenses">
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
              <DashboardTable primaryLabel="Expense" valueLabel="Amount">
                {(recentExpenses.data?.items ?? []).map((item) => (
                  <DashboardTableRow
                    key={item.id}
                    title={item.title || item.category || "Expense"}
                    value={formatCurrency(item.amount)}
                  />
                ))}
              </DashboardTable>
            )}
          </DashboardPanel>
        ) : null}
      </DashboardReveal>
    </PageContainer>
  );
}

function DashboardReveal({
  delay,
  className,
  children,
}: {
  delay: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("dashboard-reveal", className)} style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}
