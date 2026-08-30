"use client";

import { RequirePermission } from "@/components/auth/require-permission";
import { PageContainer } from "@/components/layout/page-container";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { permissions } from "@/config/permissions";
import { useAuth } from "@/components/auth/auth-provider";
import { KpiCard, formatKpiCurrency, formatKpiNumber } from "@/features/dashboard/kpi-card";
import { getErrorMessage } from "@/types/api";
import { ProfitLossCharts } from "./profit-loss-charts";
import { getDailyProfitBreakdown, getExpenseCategoryBreakdown } from "./report-breakdowns";
import { ReportPageHeader } from "./report-page-header";
import { ReportPeriodToolbar } from "./report-period-toolbar";
import { useReportPeriod } from "./use-report-period";
import {
  useDailyProfitLossQuery,
  useMonthlyProfitLossQuery,
  useYearlyProfitLossQuery,
} from "./use-reports";

export function ProfitLossReportPage() {
  const { can } = useAuth();
  const canMonthly = can(permissions.reportsMonthly);
  const { period, setPeriod, dailyDate, setDailyDate, resolved } = useReportPeriod(
    canMonthly ? "month" : "today",
  );
  const enabled = resolved.kind === "daily" || canMonthly;

  const dailyPl = useDailyProfitLossQuery(resolved.date, {
    enabled: enabled && resolved.kind === "daily",
  });
  const monthlyPl = useMonthlyProfitLossQuery(resolved.year, resolved.month, {
    enabled: enabled && resolved.kind === "monthly",
  });
  const yearlyPl = useYearlyProfitLossQuery(resolved.year, {
    enabled: enabled && resolved.kind === "yearly",
  });
  const query = resolved.kind === "daily" ? dailyPl : resolved.kind === "monthly" ? monthlyPl : yearlyPl;
  const dailyBreakdown = getDailyProfitBreakdown(query.data);
  const expenseBreakdown = getExpenseCategoryBreakdown(query.data);

  return (
    <RequirePermission permission={permissions.reportsProfit}>
      <PageContainer>
        <ReportPageHeader
          title="Profit & loss"
          description={`Backend profit and loss for ${resolved.label}. Totals are not calculated in the browser.`}
          actions={
            <ReportPeriodToolbar
              period={period}
              onPeriodChange={setPeriod}
              dailyDate={dailyDate || resolved.date}
              onDailyDateChange={setDailyDate}
              showDailyDate
              allowMonthly={canMonthly}
            />
          }
        />

        {!enabled ? (
          <EmptyState
            title="This period is not available"
            description="Monthly and yearly profit reports require monthly reports access."
          />
        ) : query.isLoading ? (
          <LoadingState label="Loading profit and loss..." />
        ) : query.isError ? (
          <ErrorState
            title="Unable to load profit and loss"
            description={getErrorMessage(query.error)}
            onRetry={() => void query.refetch()}
          />
        ) : query.data ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <KpiCard label="Revenue" value={formatKpiCurrency(query.data.revenue)} tone="primary" />
              <KpiCard
                label="Cost of goods"
                value={formatKpiCurrency(query.data.costOfGoodsSold)}
                tone="secondary"
              />
              <KpiCard
                label="Gross profit"
                value={formatKpiCurrency(query.data.grossProfit)}
                tone="success"
              />
              <KpiCard
                label="Net profit"
                value={formatKpiCurrency(query.data.netProfit)}
                tone="primary"
              />
              <KpiCard
                label="Purchases"
                value={formatKpiCurrency(query.data.purchases)}
                tone="secondary"
              />
              <KpiCard
                label="Expenses"
                value={formatKpiCurrency(query.data.expenses)}
                tone="warning"
              />
              <KpiCard label="Orders" value={formatKpiNumber(query.data.orderCount)} tone="primary" />
            </div>
            <ProfitLossCharts dailyBreakdown={dailyBreakdown} expenseBreakdown={expenseBreakdown} />
          </>
        ) : (
          <EmptyState title="No profit and loss data" />
        )}
      </PageContainer>
    </RequirePermission>
  );
}
