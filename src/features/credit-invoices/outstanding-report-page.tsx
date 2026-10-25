"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { KpiCard, formatKpiCurrency } from "@/features/dashboard/kpi-card";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/date";
import { getErrorMessage } from "@/types/api";
import { cn } from "@/lib/utils";
import {
  CREDIT_OUTSTANDING_SORTS,
  CREDIT_OUTSTANDING_STATUS_FILTERS,
  type CreditOutstandingRow,
} from "@/types/credit-invoice";
import { creditInvoicePath } from "./credit-invoice-paths";
import { CreditInvoiceScreen } from "./credit-invoice-screen";
import { CreditStatusBadge } from "./credit-status-badge";
import { useCreditInvoiceAccess } from "./use-credit-invoice-access";
import { useCreditOutstandingQuery } from "./use-credit-invoices";

const PAGE_SIZE = 20;

export function OutstandingReportPage() {
  const access = useCreditInvoiceAccess();
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [status, setStatus] = useState("outstanding");
  const [sortBy, setSortBy] = useState("invoiceDate");
  const [sortDescending, setSortDescending] = useState(true);
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search);
  const partialDates = Boolean(fromDate) !== Boolean(toDate);
  const query = useCreditOutstandingQuery(
    {
      search: debouncedSearch || undefined,
      fromDate: fromDate && toDate ? fromDate : undefined,
      toDate: fromDate && toDate ? toDate : undefined,
      status,
      page,
      pageSize: PAGE_SIZE,
      sortBy,
      sortDescending,
    },
    { enabled: access.canRead && !partialDates },
  );
  const report = query.data;

  const columns = useMemo<DataTableColumn<CreditOutstandingRow>[]>(
    () => [
      {
        accessorKey: "invoiceNumber",
        header: "Invoice",
        cell: ({ row }) =>
          row.original.invoiceNumber ? (
            <Link href={creditInvoicePath(row.original.invoiceNumber)} className="font-medium text-primary">
              {row.original.invoiceNumber}
            </Link>
          ) : (
            "—"
          ),
      },
      {
        accessorKey: "invoiceDate",
        header: "Date",
        cell: ({ row }) => formatDate(row.original.invoiceDate) || row.original.invoiceDate || "—",
      },
      {
        accessorKey: "customerName",
        header: "Customer",
        cell: ({ row }) => row.original.customerName || "—",
      },
      {
        accessorKey: "customerPhone",
        header: "Phone",
        cell: ({ row }) => row.original.customerPhone || "—",
      },
      {
        accessorKey: "totalAmount",
        header: "Total",
        cell: ({ row }) => <span className="tabular-nums">{formatCurrency(row.original.totalAmount)}</span>,
      },
      {
        accessorKey: "netPayments",
        header: "Paid",
        cell: ({ row }) => <span className="tabular-nums">{formatCurrency(row.original.netPayments)}</span>,
      },
      {
        accessorKey: "outstandingBalance",
        header: "Balance",
        cell: ({ row }) => (
          <span className="tabular-nums">{formatCurrency(row.original.outstandingBalance)}</span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <CreditStatusBadge status={row.original.status} />,
      },
    ],
    [],
  );

  return (
    <CreditInvoiceScreen mode="read">
      <PageHeader
        title="Outstanding credit"
        description={
          report?.timeZoneLabel
            ? `Invoice dates use ${report.timeZoneLabel}. Due dates are not used.`
            : "Invoice dates use the shop time zone. Due dates are not used."
        }
        actions={
          <Link href="/credit-invoices" className={cn(buttonVariants({ variant: "outline" }))}>
            Back
          </Link>
        }
      />

      <ListToolbar
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="Name, phone, or invoice number"
        filters={
          <>
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
            <Select
              value={status}
              onValueChange={(value) => {
                if (value) {
                  setStatus(value);
                  setPage(1);
                }
              }}
            >
              <SelectTrigger className="w-40" aria-label="Status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CREDIT_OUTSTANDING_STATUS_FILTERS.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={sortBy}
              onValueChange={(value) => {
                if (value) {
                  setSortBy(value);
                  setPage(1);
                }
              }}
            >
              <SelectTrigger className="w-40" aria-label="Sort by">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CREDIT_OUTSTANDING_SORTS.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSortDescending((current) => !current);
                setPage(1);
              }}
            >
              {sortDescending ? "Newest first" : "Oldest first"}
            </Button>
          </>
        }
      />

      {partialDates ? (
        <EmptyState
          title="Enter both dates"
          description="Outstanding can be unfiltered, or limited with both a from date and a to date."
        />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <KpiCard label="Invoice total" value={formatKpiCurrency(report?.totalInvoiceAmount ?? 0)} />
            <KpiCard label="Net payments" value={formatKpiCurrency(report?.netPayments ?? 0)} tone="secondary" />
            <KpiCard
              label="Outstanding"
              value={formatKpiCurrency(report?.outstandingBalance ?? 0)}
              tone="warning"
            />
          </div>
          <DataTable
            columns={columns}
            data={report?.items ?? []}
            isLoading={query.isLoading}
            isError={query.isError}
            errorMessage={getErrorMessage(query.error)}
            onRetry={() => void query.refetch()}
            emptyTitle="No credit invoices"
            emptyDescription="Nothing matches this outstanding filter."
            page={page}
            pageCount={report?.totalPages ?? 1}
            onPageChange={setPage}
          />
        </>
      )}
    </CreditInvoiceScreen>
  );
}
