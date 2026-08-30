"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { History, Plus, SlidersHorizontal, Warehouse } from "lucide-react";
import { RequirePermission } from "@/components/auth/require-permission";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { DataTableActions } from "@/components/shared/data-table-actions";
import { ErrorState } from "@/components/shared/error-state";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { permissions } from "@/config/permissions";
import { useCategoriesQuery } from "@/features/categories/use-categories";
import { useProductsQuery } from "@/features/products/use-products";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { usePermission } from "@/hooks/use-permission";
import { formatDateTime } from "@/lib/date";
import { formatNumber, formatQuantity } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/types/api";
import type { Product } from "@/types/product";
import type { ProductStockSummary, StockMovement } from "@/types/inventory";
import { formatMovementReference, formatMovementType } from "./movement-labels";
import { StockDetailDialog } from "./stock-detail-dialog";
import { StockMovementFormDialog } from "./stock-movement-form-dialog";
import { StockStatusBadge } from "./stock-status-badge";
import { useInventoryDashboardQuery, useLowStockQuery } from "./use-inventory";

const PAGE_SIZE = 20;

type StockView = "all" | "low" | "out";

type StockRow = {
  id: string;
  name: string | null;
  sku: string | null;
  barcode: string | null;
  categoryName: string | null;
  unit: string | null;
  stockQuantity: number;
  reorderLevel: number;
  isLowStock?: boolean;
  isOutOfStock?: boolean;
  updatedAt: string | null;
};

function productLabel(product: Product): string {
  return [product.name, product.size].filter(Boolean).join(" — ") || product.name || "—";
}

function fromProduct(product: Product): StockRow {
  return {
    id: product.id,
    name: productLabel(product),
    sku: product.sku,
    barcode: product.barcode,
    categoryName: product.categoryName,
    unit: product.unit,
    stockQuantity: product.stockQuantity,
    reorderLevel: product.reorderLevel,
    updatedAt: product.updatedAt,
  };
}

function fromSummary(item: ProductStockSummary): StockRow {
  return {
    id: item.id,
    name: item.name,
    sku: item.sku,
    barcode: null,
    categoryName: null,
    unit: item.unit,
    stockQuantity: item.stockQuantity,
    reorderLevel: item.reorderLevel,
    isLowStock: item.isLowStock,
    isOutOfStock: item.isOutOfStock,
    updatedAt: null,
  };
}

export function InventoryPage() {
  const canManage = usePermission(permissions.inventoryManage);
  const [stockView, setStockView] = useState<StockView>("all");
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [page, setPage] = useState(1);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustProductId, setAdjustProductId] = useState<string | null>(null);
  const [detailProductId, setDetailProductId] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(search);
  const categoriesQuery = useCategoriesQuery({});
  const dashboardQuery = useInventoryDashboardQuery();

  const productFilters = {
    search: debouncedSearch || undefined,
    categoryId: categoryId || undefined,
  };
  const productsQuery = useProductsQuery(productFilters, {
    enabled: stockView !== "low",
  });
  const lowStockQuery = useLowStockQuery(
    {
      search: debouncedSearch || undefined,
      includeOutOfStock: false,
      page,
      pageSize: PAGE_SIZE,
    },
    { enabled: stockView === "low" },
  );

  const productRows = useMemo(() => {
    const products = productsQuery.data ?? [];
    if (stockView === "out") {
      return products.filter((product) => product.stockQuantity <= 0).map(fromProduct);
    }
    return products.map(fromProduct);
  }, [productsQuery.data, stockView]);

  const clientPageCount = Math.max(1, Math.ceil(productRows.length / PAGE_SIZE));
  const clientPage = Math.min(page, clientPageCount);
  const clientPageRows = productRows.slice(
    (clientPage - 1) * PAGE_SIZE,
    clientPage * PAGE_SIZE,
  );

  const tableRows =
    stockView === "low"
      ? (lowStockQuery.data?.items ?? []).map(fromSummary)
      : clientPageRows;
  const tablePage = stockView === "low" ? (lowStockQuery.data?.page ?? page) : clientPage;
  const tablePageCount =
    stockView === "low"
      ? Math.max(1, lowStockQuery.data?.totalPages ?? 1)
      : clientPageCount;
  const tableLoading =
    stockView === "low" ? lowStockQuery.isLoading : productsQuery.isLoading;
  const tableError = stockView === "low" ? lowStockQuery.isError : productsQuery.isError;
  const tableErrorMessage = getErrorMessage(
    stockView === "low" ? lowStockQuery.error : productsQuery.error,
  );

  const emptyTitle =
    stockView === "low"
      ? "No low-stock products"
      : stockView === "out"
        ? "No out-of-stock products"
        : "No inventory records found";
  const emptyDescription =
    stockView === "low"
      ? search
        ? "No low-stock products match this search."
        : "No products are currently at or below their reorder level."
      : stockView === "out"
        ? search || categoryId
          ? "No out-of-stock products match the current search or category."
          : "No products are currently out of stock."
        : search || categoryId
          ? "Try a different search or category."
          : "Add products in the catalog to see current stock here.";

  const columns = useMemo<DataTableColumn<StockRow>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Product",
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.name || "—"}</p>
            <p className="text-xs text-muted-foreground">{row.original.sku || "No SKU"}</p>
          </div>
        ),
      },
      ...(stockView === "low"
        ? []
        : [
            {
              accessorKey: "barcode",
              header: "Barcode",
              cell: ({ row }) => row.original.barcode || "—",
            } satisfies DataTableColumn<StockRow>,
            {
              accessorKey: "categoryName",
              header: "Category",
              cell: ({ row }) => row.original.categoryName || "—",
            } satisfies DataTableColumn<StockRow>,
          ]),
      {
        accessorKey: "stockQuantity",
        header: "Quantity",
        cell: ({ row }) => formatQuantity(row.original.stockQuantity),
      },
      {
        accessorKey: "unit",
        header: "Unit",
        cell: ({ row }) => row.original.unit || "—",
      },
      {
        accessorKey: "reorderLevel",
        header: "Reorder",
        cell: ({ row }) => formatQuantity(row.original.reorderLevel),
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => (
          <StockStatusBadge
            stockQuantity={row.original.stockQuantity}
            reorderLevel={row.original.reorderLevel}
            isLowStock={row.original.isLowStock}
            isOutOfStock={row.original.isOutOfStock}
          />
        ),
      },
      ...(stockView === "low"
        ? []
        : [
            {
              accessorKey: "updatedAt",
              header: "Updated",
              cell: ({ row }) =>
                row.original.updatedAt ? formatDateTime(row.original.updatedAt) : "—",
            } satisfies DataTableColumn<StockRow>,
          ]),
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <DataTableActions
            actions={[
              {
                label: "View stock",
                icon: Warehouse,
                onClick: () => setDetailProductId(row.original.id),
              },
              ...(canManage
                ? [
                    {
                      label: "Adjust stock",
                      icon: SlidersHorizontal,
                      onClick: () => {
                        setAdjustProductId(row.original.id);
                        setAdjustOpen(true);
                      },
                    },
                  ]
                : []),
            ]}
          />
        ),
      },
    ],
    [canManage, stockView],
  );

  const dashboard = dashboardQuery.data;
  const recentMovements = dashboard?.recentMovements ?? [];

  function changeStockView(next: StockView) {
    setStockView(next);
    setPage(1);
    if (next === "low") {
      setCategoryId("");
    }
  }

  return (
    <RequirePermission permission={permissions.inventory}>
      <PageContainer>
        <PageHeader
          title="Inventory"
          description="Current stock from the catalog, with low-stock alerts and stock movements from the backend."
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/inventory/movements"
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                <History />
                Stock history
              </Link>
              {canManage ? (
                <Button
                  type="button"
                  onClick={() => {
                    setAdjustProductId(null);
                    setAdjustOpen(true);
                  }}
                >
                  <Plus />
                  Record movement
                </Button>
              ) : null}
            </div>
          }
        />

        {dashboardQuery.isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <Card key={index}>
                <CardHeader>
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : dashboardQuery.isError ? (
          <ErrorState
            title="Unable to load inventory"
            description={getErrorMessage(dashboardQuery.error)}
            onRetry={() => void dashboardQuery.refetch()}
          />
        ) : dashboard ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <OverviewCard label="Total products" value={dashboard.totalProducts} />
            <OverviewCard label="Active products" value={dashboard.activeProducts} />
            <OverviewCard
              label="Low stock"
              value={dashboard.lowStockCount}
              onSelect={() => changeStockView("low")}
            />
            <OverviewCard
              label="Out of stock"
              value={dashboard.outOfStockCount}
              onSelect={() => changeStockView("out")}
            />
            <OverviewCard
              label="Total stock units"
              value={dashboard.totalStockUnits}
              format="quantity"
            />
          </div>
        ) : null}

        {dashboardQuery.isSuccess && recentMovements.length > 0 ? (
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Recent movements</CardTitle>
                <CardDescription>
                  Latest stock changes from the inventory dashboard. Open stock history for the
                  full list.
                </CardDescription>
              </div>
              <CardAction>
                <Link
                  href="/inventory/movements"
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                >
                  View all
                </Link>
              </CardAction>
            </CardHeader>
            <CardContent>
              <RecentMovementsList items={recentMovements} />
            </CardContent>
          </Card>
        ) : null}

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Stock status">
            <StockViewTab
              selected={stockView === "all"}
              label="All stock"
              count={dashboard?.totalProducts}
              onSelect={() => changeStockView("all")}
            />
            <StockViewTab
              selected={stockView === "low"}
              label="Low stock"
              count={dashboard?.lowStockCount}
              onSelect={() => changeStockView("low")}
            />
            <StockViewTab
              selected={stockView === "out"}
              label="Out of stock"
              count={dashboard?.outOfStockCount}
              onSelect={() => changeStockView("out")}
            />
          </div>

          <ListToolbar
              search={search}
              onSearchChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
              searchPlaceholder={
                stockView === "low" ? "Search low-stock products" : "Search products"
              }
              filters={
                stockView === "low" ? undefined : (
                  <Select
                    value={categoryId || "__all__"}
                    onValueChange={(value) => {
                      setCategoryId(value === "__all__" || value == null ? "" : value);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-44">
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">All categories</SelectItem>
                      {(categoriesQuery.data ?? []).map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )
              }
            />

            <DataTable
              columns={columns}
              data={tableRows}
              isLoading={tableLoading}
              isError={tableError}
              errorMessage={tableErrorMessage}
              onRetry={() =>
                void (stockView === "low" ? lowStockQuery.refetch() : productsQuery.refetch())
              }
              emptyTitle={emptyTitle}
              emptyDescription={emptyDescription}
              page={tablePage}
              pageCount={tablePageCount}
            onPageChange={setPage}
          />
        </div>

        <StockMovementFormDialog
          open={adjustOpen}
          onOpenChange={(open) => {
            setAdjustOpen(open);
            if (!open) {
              setAdjustProductId(null);
            }
          }}
          productId={adjustProductId}
        />

        <StockDetailDialog
          open={Boolean(detailProductId)}
          onOpenChange={(open) => {
            if (!open) {
              setDetailProductId(null);
            }
          }}
          productId={detailProductId}
        />
      </PageContainer>
    </RequirePermission>
  );
}

function OverviewCard({
  label,
  value,
  onSelect,
  format = "number",
}: {
  label: string;
  value: number;
  onSelect?: () => void;
  format?: "number" | "quantity";
}) {
  const display = format === "quantity" ? formatQuantity(value) : formatNumber(value);
  const body = (
    <CardHeader>
      <CardDescription>{label}</CardDescription>
      <CardTitle className="text-2xl tabular-nums">{display}</CardTitle>
    </CardHeader>
  );

  if (!onSelect) {
    return <Card>{body}</Card>;
  }

  return (
    <Card className="p-0">
      <button
        type="button"
        onClick={onSelect}
        className="w-full rounded-xl text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {body}
      </button>
    </Card>
  );
}

function StockViewTab({
  selected,
  label,
  count,
  onSelect,
}: {
  selected: boolean;
  label: string;
  count?: number;
  onSelect: () => void;
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant={selected ? "default" : "outline"}
      role="tab"
      aria-selected={selected}
      onClick={onSelect}
    >
      {label}
      {count != null ? (
        <span className="tabular-nums opacity-80">{formatNumber(count)}</span>
      ) : null}
    </Button>
  );
}

function RecentMovementsList({ items }: { items: StockMovement[] }) {
  return (
    <ul className="divide-y">
      {items.slice(0, 5).map((item) => (
        <li key={item.id} className="flex flex-wrap items-baseline justify-between gap-2 py-2">
          <div>
            <p className="font-medium">{item.productName || "—"}</p>
            <p className="text-xs text-muted-foreground">
              {formatMovementType(item.movementType)}
              {item.sku ? ` · ${item.sku}` : ""}
              {` · ${formatMovementReference(item)}`}
            </p>
          </div>
          <p className="text-xs text-muted-foreground">{formatDateTime(item.createdAt)}</p>
        </li>
      ))}
    </ul>
  );
}
