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
import { formatCurrency } from "@/lib/currency";
import { formatDateTime } from "@/lib/date";
import { getErrorMessage } from "@/types/api";
import { cn } from "@/lib/utils";
import {
  CREDIT_COLLECTION_SORTS,
  CREDIT_INVOICE_PAYMENT_METHODS,
  type CreditCollectionRow,
} from "@/types/credit-invoice";
import { creditInvoicePath, creditShopToday } from "./credit-invoice-paths";
import { CreditInvoiceScreen } from "./credit-invoice-screen";
import { CreditStatusBadge } from "./credit-status-badge";
import { useCreditInvoiceAccess } from "./use-credit-invoice-access";
import { useCreditCollectionsQuery } from "./use-credit-invoices";

const PAGE_SIZE = 20;

export function CollectionsReportPage() {
  const access = useCreditInvoiceAccess();
  const today = creditShopToday();
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [paymentMethod, setPaymentMethod] = useState("all");
  const [sortBy, setSortBy] = useState("paidAt");
  const [sortDescending, setSortDescending] = useState(true);
  const [page, setPage] = useState(1);
  const query = useCreditCollectionsQuery(
    {
      fromDate,
      toDate,
      paymentMethod: paymentMethod === "all" ? undefined : paymentMethod,
      page,
      pageSize: PAGE_SIZE,
      sortBy,
      sortDescending,
    },
    { enabled: access.canRead && Boolean(fromDate && toDate) },
  );
  const report = query.data;

  const columns = useMemo<DataTableColumn<CreditCollectionRow>[]>(
    () => [
      {
        accessorKey: "receiptNumber",
        header: "Receipt",
        cell: ({ row }) => row.original.receiptNumber || "—",
      },
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
        accessorKey: "customerName",
        header: "Customer",
        cell: ({ row }) => row.original.customerName || "—",
      },
      {
        accessorKey: "paidAt",
        header: "Paid at",
        cell: ({ row }) => formatDateTime(row.original.paidAt) || row.original.paidAt,
      },
      {
        accessorKey: "paymentMethod",
        header: "Method",
        cell: ({ row }) => row.original.paymentMethod || "—",
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => <span className="tabular-nums">{formatCurrency(row.original.amount)}</span>,
      },
      {
        accessorKey: "cashierName",
        header: "Cashier",
        cell: ({ row }) => row.original.cashierName || "—",
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
        title="Credit collections"
        description={
          report?.timeZoneLabel
            ? `Payments in ${report.timeZoneLabel}. Reversed receipts stay in the list.`
            : "Both dates are required. Reversed receipts stay in the list."
        }
        actions={
          <Link href="/credit-invoices" className={cn(buttonVariants({ variant: "outline" }))}>
            Back
          </Link>
        }
      />

      <ListToolbar
        hideSearch
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
              value={paymentMethod}
              onValueChange={(value) => {
                if (value) {
                  setPaymentMethod(value);
                  setPage(1);
                }
              }}
            >
              <SelectTrigger className="w-36" aria-label="Payment method">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All methods</SelectItem>
                {CREDIT_INVOICE_PAYMENT_METHODS.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method}
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
                {CREDIT_COLLECTION_SORTS.map((item) => (
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

      {!fromDate || !toDate ? (
        <EmptyState
          title="Choose a date range"
          description="Collections require both a from date and a to date."
        />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <KpiCard label="Gross" value={formatKpiCurrency(report?.grossCollections ?? 0)} />
            <KpiCard
              label="Reversed"
              value={formatKpiCurrency(report?.reversedCollections ?? 0)}
              tone="destructive"
            />
            <KpiCard label="Net" value={formatKpiCurrency(report?.netCollections ?? 0)} tone="secondary" />
          </div>
          <DataTable
            columns={columns}
            data={report?.items ?? []}
            isLoading={query.isLoading}
            isError={query.isError}
            errorMessage={getErrorMessage(query.error)}
            onRetry={() => void query.refetch()}
            emptyTitle="No collections"
            emptyDescription="No credit payments were posted in this date range."
            page={page}
            pageCount={report?.totalPages ?? 1}
            onPageChange={setPage}
          />
        </>
      )}
    </CreditInvoiceScreen>
  );
}
