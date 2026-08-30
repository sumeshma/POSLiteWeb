"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { RequirePermission } from "@/components/auth/require-permission";
import { PageContainer } from "@/components/layout/page-container";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { buttonVariants } from "@/components/ui/button";
import { permissions } from "@/config/permissions";
import { KpiCard, formatKpiNumber } from "@/features/dashboard/kpi-card";
import { StockStatusBadge } from "@/features/inventory/stock-status-badge";
import { formatMovementType } from "@/features/inventory/movement-labels";
import {
  useInventoryDashboardQuery,
  useLowStockQuery,
} from "@/features/inventory/use-inventory";
import { formatDateTime } from "@/lib/date";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/types/api";
import type { ProductStockSummary, StockMovement } from "@/types/inventory";
import { ReportPageHeader } from "./report-page-header";

const PAGE_SIZE = 20;

export function InventoryReportPage() {
  const [page, setPage] = useState(1);
  const dashboardQuery = useInventoryDashboardQuery();
  const lowStockQuery = useLowStockQuery({
    includeOutOfStock: true,
    page,
    pageSize: PAGE_SIZE,
  });
  const dashboard = dashboardQuery.data;

  const lowStockColumns = useMemo<DataTableColumn<ProductStockSummary>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Product",
        cell: ({ row }) => row.original.name || "—",
      },
      {
        accessorKey: "sku",
        header: "SKU",
        cell: ({ row }) => row.original.sku || "—",
      },
      {
        accessorKey: "stockQuantity",
        header: "Stock",
        cell: ({ row }) => (
          <span className="tabular-nums">{row.original.stockQuantity}</span>
        ),
      },
      {
        accessorKey: "reorderLevel",
        header: "Reorder",
        cell: ({ row }) => (
          <span className="tabular-nums">{row.original.reorderLevel}</span>
        ),
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
    ],
    [],
  );

  const movementColumns = useMemo<DataTableColumn<StockMovement>[]>(
    () => [
      {
        accessorKey: "createdAt",
        header: "When",
        cell: ({ row }) => formatDateTime(row.original.createdAt) || "—",
      },
      {
        accessorKey: "productName",
        header: "Product",
        cell: ({ row }) => row.original.productName || "—",
      },
      {
        accessorKey: "movementType",
        header: "Type",
        cell: ({ row }) => formatMovementType(row.original.movementType),
      },
      {
        accessorKey: "quantity",
        header: "Qty",
        cell: ({ row }) => <span className="tabular-nums">{row.original.quantity}</span>,
      },
      {
        accessorKey: "newStock",
        header: "New stock",
        cell: ({ row }) => <span className="tabular-nums">{row.original.newStock}</span>,
      },
    ],
    [],
  );

  return (
    <RequirePermission permission={permissions.inventory}>
      <PageContainer>
        <ReportPageHeader
          title="Inventory report"
          description="Current stock snapshot from the inventory dashboard. Inventory rupee value is not provided by the backend and is not estimated here."
          actions={
            <Link href="/inventory" className={cn(buttonVariants({ variant: "outline" }))}>
              Open inventory
            </Link>
          }
        />

        {dashboardQuery.isLoading ? (
          <LoadingState label="Loading inventory summary..." />
        ) : dashboardQuery.isError ? (
          <ErrorState
            title="Unable to load inventory summary"
            description={getErrorMessage(dashboardQuery.error)}
            onRetry={() => void dashboardQuery.refetch()}
          />
        ) : dashboard ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <KpiCard label="Products" value={formatKpiNumber(dashboard.totalProducts)} tone="primary" />
            <KpiCard
              label="Active"
              value={formatKpiNumber(dashboard.activeProducts)}
              tone="secondary"
            />
            <KpiCard
              label="Stock units"
              value={formatKpiNumber(dashboard.totalStockUnits)}
              tone="primary"
            />
            <KpiCard
              label="Low stock"
              value={formatKpiNumber(dashboard.lowStockCount)}
              tone="warning"
            />
            <KpiCard
              label="Out of stock"
              value={formatKpiNumber(dashboard.outOfStockCount)}
              tone="destructive"
            />
          </div>
        ) : null}

        <div className="space-y-3">
          <h2 className="text-sm font-medium">Low and out of stock</h2>
          <div className="overflow-x-auto">
            <DataTable
              columns={lowStockColumns}
              data={lowStockQuery.data?.items ?? []}
              isLoading={lowStockQuery.isLoading}
              isError={lowStockQuery.isError}
              errorMessage={getErrorMessage(lowStockQuery.error)}
              onRetry={() => void lowStockQuery.refetch()}
              emptyTitle="No low-stock items"
              emptyDescription="Nothing is currently below reorder level or out of stock."
              page={lowStockQuery.data?.page ?? page}
              pageCount={Math.max(1, lowStockQuery.data?.totalPages ?? 1)}
              onPageChange={setPage}
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-medium">Recent stock movements</h2>
            <Link href="/inventory/movements" className="text-sm text-primary hover:underline">
              Full history
            </Link>
          </div>
          <div className="overflow-x-auto">
            <DataTable
              columns={movementColumns}
              data={dashboard?.recentMovements ?? []}
              emptyTitle="No recent movements"
              emptyDescription="Stock movements from the inventory dashboard will appear here."
            />
          </div>
        </div>
      </PageContainer>
    </RequirePermission>
  );
}
