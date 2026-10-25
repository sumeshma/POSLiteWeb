"use client";

import { useMemo, useState } from "react";
import { RequirePermission } from "@/components/auth/require-permission";
import { PageContainer } from "@/components/layout/page-container";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { LoadingState } from "@/components/shared/loading-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { permissions } from "@/config/permissions";
import { SalesCharts, type TrendPoint } from "@/features/dashboard/sales-charts";
import { GST_RANGE_PRESETS, resolveGstRange, type GstRangePreset } from "@/features/dashboard/period";
import { KpiCard, formatKpiCurrency, formatKpiNumber } from "@/features/dashboard/kpi-card";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { formatCurrency } from "@/lib/currency";
import { formatDate, formatDateTime } from "@/lib/date";
import { getErrorMessage } from "@/types/api";
import {
  PRODUCT_SALES_SORTS,
  type ProductSalesBillLine,
  type ProductSalesItem,
  type ProductSalesSort,
} from "@/types/report";
import { parseProductSalesLimit, productSalesRangeError } from "./product-sales-range";
import { ReportPageHeader } from "./report-page-header";
import { useProductSalesQuery } from "./use-reports";

const BILL_LINE_PAGE_SIZE = 50;

function isGstPreset(value: string | null): value is GstRangePreset {
  return GST_RANGE_PRESETS.some((item) => item.id === value);
}

function isProductSalesSort(value: string | null): value is ProductSalesSort {
  return PRODUCT_SALES_SORTS.some((item) => item.id === value);
}

function formatQuantity(value: number): string {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 3 }).format(value);
}

export function ProductSalesReportPage() {
  const [preset, setPreset] = useState<GstRangePreset>("month");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<ProductSalesSort>("revenue");
  const [limitText, setLimitText] = useState("");
  const [productId, setProductId] = useState<string | null>(null);
  const [billLinePage, setBillLinePage] = useState(1);
  const debouncedSearch = useDebouncedValue(search);
  const range = useMemo(
    () => resolveGstRange(preset, customFrom, customTo),
    [customFrom, customTo, preset],
  );
  const rangeError = productSalesRangeError(range.fromDate, range.toDate);
  const limit = parseProductSalesLimit(limitText);
  const trimmedSearch = debouncedSearch.trim();
  const searchParam = trimmedSearch.length >= 2 ? trimmedSearch : undefined;
  const canQuery = !rangeError && !limit.error;
  const query = useProductSalesQuery(
    {
      fromDate: range.fromDate,
      toDate: range.toDate,
      sortBy,
      limit: limit.value,
      search: searchParam,
      productId: productId ?? undefined,
      billLinePage,
      billLinePageSize: BILL_LINE_PAGE_SIZE,
    },
    { enabled: canQuery },
  );
  const report = canQuery ? query.data : undefined;
  const items = report?.items ?? [];
  const selected = items.find((item) => item.productId === productId) ?? null;
  const billLines = productId ? (report?.billLines ?? []) : [];
  const billPageSize = report?.billLinePageSize || BILL_LINE_PAGE_SIZE;
  const billPageCount = Math.max(1, Math.ceil((report?.billLineTotalCount ?? 0) / billPageSize));

  const trend = useMemo<TrendPoint[]>(
    () =>
      (productId ? (report?.dailyBreakdown ?? []) : []).map((point) => ({
        label: formatDate(point.date) || point.date.slice(0, 10),
        totalSales: point.revenue,
        orderCount: point.quantitySold,
      })),
    [productId, report?.dailyBreakdown],
  );

  const columns = useMemo<DataTableColumn<ProductSalesItem>[]>(
    () => [
      {
        accessorKey: "productName",
        header: "Product",
        cell: ({ row }) => {
          const selectedRow = row.original.productId === productId;
          return (
            <button
              type="button"
              className="text-left font-medium text-primary hover:underline"
              aria-pressed={selectedRow}
              onClick={() => {
                setBillLinePage(1);
                setProductId(selectedRow ? null : row.original.productId);
              }}
            >
              {row.original.productName || "Product"}
            </button>
          );
        },
      },
      { accessorKey: "sku", header: "SKU", cell: ({ row }) => row.original.sku || "—" },
      { accessorKey: "size", header: "Size", cell: ({ row }) => row.original.size || "—" },
      {
        accessorKey: "categoryName",
        header: "Category",
        cell: ({ row }) => row.original.categoryName || "—",
      },
      { accessorKey: "unit", header: "Unit", cell: ({ row }) => row.original.unit || "—" },
      {
        accessorKey: "quantitySold",
        header: "Quantity",
        cell: ({ row }) => (
          <span className="tabular-nums">{formatQuantity(row.original.quantitySold)}</span>
        ),
      },
      {
        accessorKey: "orderCount",
        header: "Bills",
        cell: ({ row }) => <span className="tabular-nums">{formatKpiNumber(row.original.orderCount)}</span>,
      },
      {
        accessorKey: "revenue",
        header: "Revenue",
        cell: ({ row }) => <span className="tabular-nums">{formatCurrency(row.original.revenue)}</span>,
      },
      {
        accessorKey: "discountAmount",
        header: "Discount",
        cell: ({ row }) => (
          <span className="tabular-nums">{formatCurrency(row.original.discountAmount)}</span>
        ),
      },
      {
        accessorKey: "taxAmount",
        header: "Tax",
        cell: ({ row }) => <span className="tabular-nums">{formatCurrency(row.original.taxAmount)}</span>,
      },
      {
        accessorKey: "costOfGoodsSold",
        header: "Cost",
        cell: ({ row }) => (
          <span className="tabular-nums">{formatCurrency(row.original.costOfGoodsSold)}</span>
        ),
      },
      {
        accessorKey: "grossProfit",
        header: "Gross profit",
        cell: ({ row }) => (
          <span className="tabular-nums">{formatCurrency(row.original.grossProfit)}</span>
        ),
      },
    ],
    [productId],
  );

  const billColumns = useMemo<DataTableColumn<ProductSalesBillLine>[]>(
    () => [
      {
        accessorKey: "billNumber",
        header: "Bill",
        cell: ({ row }) => row.original.billNumber || "—",
      },
      {
        accessorKey: "soldAt",
        header: "Sold at",
        cell: ({ row }) => formatDateTime(row.original.soldAt) || row.original.soldAt,
      },
      {
        accessorKey: "quantity",
        header: "Quantity",
        cell: ({ row }) => <span className="tabular-nums">{formatQuantity(row.original.quantity)}</span>,
      },
      {
        accessorKey: "unitPrice",
        header: "Price",
        cell: ({ row }) => <span className="tabular-nums">{formatCurrency(row.original.unitPrice)}</span>,
      },
      {
        accessorKey: "lineTotal",
        header: "Total",
        cell: ({ row }) => <span className="tabular-nums">{formatCurrency(row.original.lineTotal)}</span>,
      },
      {
        accessorKey: "discountAmount",
        header: "Discount",
        cell: ({ row }) => (
          <span className="tabular-nums">{formatCurrency(row.original.discountAmount)}</span>
        ),
      },
    ],
    [],
  );

  function clearProduct() {
    setProductId(null);
    setBillLinePage(1);
  }

  return (
    <RequirePermission permission={permissions.reports}>
      <PageContainer>
        <ReportPageHeader
          title="Product sales"
          description={`Completed POS bills for ${range.label}. Dates are UTC calendar dates. Credit invoices are not included.`}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={preset}
                onValueChange={(value) => {
                  if (isGstPreset(value)) {
                    setPreset(value);
                    clearProduct();
                  }
                }}
              >
                <SelectTrigger className="w-40" aria-label="Product sales date range">
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
                    onChange={(event) => {
                      setCustomFrom(event.target.value);
                      clearProduct();
                    }}
                  />
                  <Input
                    type="date"
                    value={customTo}
                    aria-label="To date"
                    className="w-36"
                    onChange={(event) => {
                      setCustomTo(event.target.value);
                      clearProduct();
                    }}
                  />
                </>
              ) : null}
            </div>
          }
        />

        <ListToolbar
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
            clearProduct();
          }}
          searchPlaceholder="Name or SKU (2+ characters)"
          filters={
            <>
              <Select
                value={sortBy}
                onValueChange={(value) => {
                  if (isProductSalesSort(value)) {
                    setSortBy(value);
                    clearProduct();
                  }
                }}
              >
                <SelectTrigger className="w-36" aria-label="Sort products">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_SALES_SORTS.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                min={1}
                max={500}
                value={limitText}
                aria-label="Product limit"
                placeholder="All products"
                className="w-36"
                onChange={(event) => {
                  setLimitText(event.target.value);
                  clearProduct();
                }}
              />
            </>
          }
        />
        {trimmedSearch.length === 1 ? (
          <p className="text-xs text-muted-foreground">Search is sent from 2 characters. A single character is ignored.</p>
        ) : null}

        {rangeError ? (
          <EmptyState title="Choose a valid date range" description={rangeError} />
        ) : limit.error ? (
          <EmptyState title="Check the product limit" description={limit.error} />
        ) : query.isLoading ? (
          <LoadingState label="Loading product sales..." />
        ) : query.isError ? (
          <ErrorState
            title="Unable to load product sales"
            description={getErrorMessage(query.error)}
            onRetry={() => void query.refetch()}
          />
        ) : report ? (
          <>
            <div className="grid gap-3 sm:grid-cols-3">
              <KpiCard label="Products" value={formatKpiNumber(report.totalProducts)} tone="primary" />
              <KpiCard
                label="Quantity sold"
                value={formatQuantity(report.totalQuantitySold)}
                tone="secondary"
              />
              <KpiCard label="Revenue" value={formatKpiCurrency(report.totalRevenue)} tone="primary" />
            </div>
            <div className="overflow-x-auto">
              <DataTable
                columns={columns}
                data={items}
                emptyTitle="No products sold"
                emptyDescription="Completed bills in this range did not include a matching product."
              />
            </div>
            {productId ? (
              <section className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-medium">{selected?.productName || "Selected product"}</h2>
                    <p className="text-xs text-muted-foreground">
                      Daily quantity and revenue, then the completed bills that included this product.
                    </p>
                  </div>
                  <Button type="button" variant="outline" onClick={clearProduct}>
                    Clear product
                  </Button>
                </div>
                <SalesCharts
                  trend={trend}
                  trendTitle="Daily sales"
                  trendHint="Quantity uses the right axis. Revenue uses the left axis."
                  payments={[]}
                  orderTypes={[]}
                  salesSeriesLabel="Revenue"
                  countSeriesLabel="Quantity"
                  countAllowDecimals
                />
                <div className="overflow-x-auto">
                  <DataTable
                    columns={billColumns}
                    data={billLines}
                    pageSize={BILL_LINE_PAGE_SIZE}
                    emptyTitle="No bill lines"
                    emptyDescription="This product has no completed bill lines in the selected range."
                  />
                </div>
                <div className="flex items-center justify-end gap-2">
                  <p className="mr-auto text-xs text-muted-foreground">
                    Bill lines page {report.billLinePage || billLinePage} of {billPageCount}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={billLinePage <= 1 || query.isFetching}
                    onClick={() => setBillLinePage((page) => Math.max(1, page - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={billLinePage >= billPageCount || query.isFetching}
                    onClick={() => setBillLinePage((page) => page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </section>
            ) : null}
          </>
        ) : (
          <EmptyState title="No product sales" />
        )}
      </PageContainer>
    </RequirePermission>
  );
}
