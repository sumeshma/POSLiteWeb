"use client";

import { useMemo, useState } from "react";
import { RequirePermission } from "@/components/auth/require-permission";
import { PageContainer } from "@/components/layout/page-container";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { permissions } from "@/config/permissions";
import { GST_RANGE_PRESETS, resolveGstRange, type GstRangePreset } from "@/features/dashboard/period";
import { KpiCard, formatKpiCurrency, formatKpiNumber } from "@/features/dashboard/kpi-card";
import { formatCurrency } from "@/lib/currency";
import { getErrorMessage } from "@/types/api";
import type { GstRateBreakdown } from "@/types/report";
import { GstCharts } from "./gst-charts";
import { ReportPageHeader } from "./report-page-header";
import { useGstReportQuery } from "./use-reports";

function isGstPreset(value: string | null): value is GstRangePreset {
  return GST_RANGE_PRESETS.some((item) => item.id === value);
}

export function GstReportPage() {
  const [preset, setPreset] = useState<GstRangePreset>("month");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const range = useMemo(
    () => resolveGstRange(preset, customFrom, customTo),
    [customFrom, customTo, preset],
  );
  const query = useGstReportQuery(range.fromDate, range.toDate);

  const columns = useMemo<DataTableColumn<GstRateBreakdown>[]>(
    () => [
      {
        accessorKey: "taxRatePercent",
        header: "Rate",
        cell: ({ row }) => `${row.original.taxRatePercent}%`,
      },
      {
        accessorKey: "taxableAmount",
        header: "Taxable",
        cell: ({ row }) => (
          <span className="tabular-nums">{formatCurrency(row.original.taxableAmount)}</span>
        ),
      },
      {
        accessorKey: "taxAmount",
        header: "Tax",
        cell: ({ row }) => (
          <span className="tabular-nums">{formatCurrency(row.original.taxAmount)}</span>
        ),
      },
      {
        accessorKey: "cgstAmount",
        header: "CGST",
        cell: ({ row }) => (
          <span className="tabular-nums">{formatCurrency(row.original.cgstAmount)}</span>
        ),
      },
      {
        accessorKey: "sgstAmount",
        header: "SGST",
        cell: ({ row }) => (
          <span className="tabular-nums">{formatCurrency(row.original.sgstAmount)}</span>
        ),
      },
    ],
    [],
  );

  return (
    <RequirePermission permission={permissions.reportsTax}>
      <PageContainer>
        <ReportPageHeader
          title="GST report"
          description={`Backend GST totals for ${range.label}. fromDate and toDate are required by the API.`}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={preset}
                onValueChange={(value) => {
                  if (isGstPreset(value)) {
                    setPreset(value);
                  }
                }}
              >
                <SelectTrigger className="w-40" aria-label="GST date range">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GST_RANGE_PRESETS.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {preset === "custom" ? (
                <>
                  <Input
                    type="date"
                    value={customFrom}
                    aria-label="From date"
                    className="w-36"
                    onChange={(event) => setCustomFrom(event.target.value)}
                  />
                  <Input
                    type="date"
                    value={customTo}
                    aria-label="To date"
                    className="w-36"
                    onChange={(event) => setCustomTo(event.target.value)}
                  />
                </>
              ) : null}
            </div>
          }
        />

        {!range.fromDate || !range.toDate ? (
          <EmptyState
            title="Choose a date range"
            description="The GST API requires both a start date and an end date."
          />
        ) : query.isLoading ? (
          <LoadingState label="Loading GST report..." />
        ) : query.isError ? (
          <ErrorState
            title="Unable to load GST report"
            description={getErrorMessage(query.error)}
            onRetry={() => void query.refetch()}
          />
        ) : query.data ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <KpiCard
                label="Taxable"
                value={formatKpiCurrency(query.data.totalTaxableAmount)}
                tone="primary"
              />
              <KpiCard
                label="Tax"
                value={formatKpiCurrency(query.data.totalTaxAmount)}
                tone="secondary"
              />
              <KpiCard
                label="CGST"
                value={formatKpiCurrency(query.data.totalCgst)}
                tone="primary"
              />
              <KpiCard
                label="SGST"
                value={formatKpiCurrency(query.data.totalSgst)}
                tone="secondary"
              />
              <KpiCard
                label="Bills"
                value={formatKpiNumber(query.data.orderCount)}
                tone="primary"
              />
            </div>
            <GstCharts rates={query.data.rateBreakdown ?? []} />
            <div className="overflow-x-auto">
              <DataTable
                columns={columns}
                data={query.data.rateBreakdown ?? []}
                emptyTitle="No GST rate rows"
                emptyDescription="There is no rate breakdown for this date range."
              />
            </div>
          </>
        ) : (
          <EmptyState title="No GST data" />
        )}
      </PageContainer>
    </RequirePermission>
  );
}
