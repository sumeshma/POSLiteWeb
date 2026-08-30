import { apiClient } from "@/lib/api-client";
import { toSearchParams } from "@/lib/search-params";
import type { PagedResult } from "@/types/api";
import type {
  CreatePurchaseRequest,
  Purchase,
  PurchaseListFilters,
} from "@/types/purchase";

export async function listPurchases(
  filters: PurchaseListFilters,
  signal?: AbortSignal,
): Promise<PagedResult<Purchase>> {
  return apiClient.get<PagedResult<Purchase>>(
    `/api/purchases${toSearchParams({
      search: filters.search,
      supplierId: filters.supplierId,
      fromDate: filters.fromDate,
      toDate: filters.toDate,
      page: filters.page,
      pageSize: filters.pageSize,
    })}`,
    { signal },
  );
}

export async function getPurchase(id: string, signal?: AbortSignal): Promise<Purchase> {
  return apiClient.get<Purchase>(`/api/purchases/${id}`, { signal });
}

export async function createPurchase(body: CreatePurchaseRequest): Promise<Purchase> {
  return apiClient.post<Purchase>("/api/purchases", body);
}
