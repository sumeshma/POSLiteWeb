"use client";

import Link from "next/link";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { useCreditInvoiceAccess } from "@/features/credit-invoices/use-credit-invoice-access";
import { useCreditInvoiceSummaryQuery } from "@/features/credit-invoices/use-credit-invoices";
import { formatDate } from "@/lib/date";
import { getErrorMessage } from "@/types/api";
import { formatKpiCurrency, formatKpiNumber, KpiCard } from "./kpi-card";

export function CreditSummaryStrip() {
  const access = useCreditInvoiceAccess();
  const summaryQuery = useCreditInvoiceSummaryQuery({ enabled: access.canRead });

  if (!access.canRead) {
    return null;
  }

  const summary = summaryQuery.data;
  const shopDate = formatDate(summary?.shopDate) || "today";
  const turnedOff = access.featureQuery.isSuccess && !access.enabled;

  return (
    <section className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-foreground/10">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="truncate text-sm font-medium">Credit invoices</h2>
        <Link
          href="/credit-invoices"
          className="rounded-md px-2 py-1 text-xs font-medium text-brand-secondary no-underline transition-colors hover:bg-brand-secondary-soft"
        >
          Open
        </Link>
      </div>
      {turnedOff ? (
        <p className="mb-3 text-xs text-muted-foreground">
          Credit invoices are turned off for this shop. History and these totals stay available.
        </p>
      ) : (
        <p className="mb-3 text-xs text-muted-foreground">
          Outstanding balance, plus collections for the shop date. This does not follow the sales period above.
        </p>
      )}
      {summaryQuery.isLoading ? (
        <LoadingState className="py-4" label="Loading credit summary..." />
      ) : summaryQuery.isError ? (
        <ErrorState
          className="py-4"
          title="Unable to load credit summary"
          description={getErrorMessage(summaryQuery.error)}
          onRetry={() => void summaryQuery.refetch()}
        />
      ) : (
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <Link
            href="/credit-invoices/outstanding"
            className="rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <KpiCard
              label="Outstanding"
              value={formatKpiCurrency(summary?.outstandingBalance ?? 0)}
              hint={summary?.timeZoneLabel ?? undefined}
              tone="warning"
            />
          </Link>
          <Link
            href="/credit-invoices/outstanding"
            className="rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <KpiCard
              label="Open invoices"
              value={formatKpiNumber(summary?.outstandingInvoices ?? 0)}
              tone="primary"
            />
          </Link>
          <Link
            href="/credit-invoices/collections"
            className="rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <KpiCard
              label="Collected today"
              value={formatKpiCurrency(summary?.collectionsToday ?? 0)}
              hint={shopDate}
              tone="secondary"
            />
          </Link>
          <Link
            href="/credit-invoices/collections"
            className="rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <KpiCard
              label="Reversed today"
              value={formatKpiCurrency(summary?.reversedToday ?? 0)}
              hint={shopDate}
              tone="destructive"
            />
          </Link>
        </div>
      )}
    </section>
  );
}
