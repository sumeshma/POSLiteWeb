import { apiClient } from "@/lib/api-client";
import { toSearchParams } from "@/lib/search-params";
import type { PagedResult } from "@/types/api";
import type {
  CreateStockMovementRequest,
  InventoryDashboard,
  LowStockAlertCount,
  LowStockFilters,
  ProductStockSummary,
  StockMovement,
  StockMovementFilters,
} from "@/types/inventory";

export async function getInventoryDashboard(
  signal?: AbortSignal,
): Promise<InventoryDashboard> {
  return apiClient.get<InventoryDashboard>("/api/inventory/dashboard", { signal });
}

export async function getLowStockCount(signal?: AbortSignal): Promise<LowStockAlertCount> {
  return apiClient.get<LowStockAlertCount>("/api/inventory/low-stock/count", { signal });
}

export async function listLowStock(
  filters: LowStockFilters,
  signal?: AbortSignal,
): Promise<PagedResult<ProductStockSummary>> {
  return apiClient.get<PagedResult<ProductStockSummary>>(
    `/api/inventory/low-stock${toSearchParams({
      search: filters.search,
      includeOutOfStock: filters.includeOutOfStock,
      page: filters.page,
      pageSize: filters.pageSize,
    })}`,
    { signal },
  );
}

export async function listStockMovements(
  filters: StockMovementFilters,
  signal?: AbortSignal,
): Promise<PagedResult<StockMovement>> {
  return apiClient.get<PagedResult<StockMovement>>(
    `/api/inventory/movements${toSearchParams({
      search: filters.search,
      productId: filters.productId,
      movementType: filters.movementType,
      fromDate: filters.fromDate,
      toDate: filters.toDate,
      page: filters.page,
      pageSize: filters.pageSize,
    })}`,
    { signal },
  );
}

export async function createStockMovement(
  body: CreateStockMovementRequest,
): Promise<StockMovement> {
  return apiClient.post<StockMovement>("/api/inventory/movements", body);
}
