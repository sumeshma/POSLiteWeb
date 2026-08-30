import { apiClient } from "@/lib/api-client";
import { toSearchParams } from "@/lib/search-params";
import type { PagedResult } from "@/types/api";
import type { OrderListFilters, OrderSummary } from "@/types/order";

export async function listOrders(
  filters: OrderListFilters,
  signal?: AbortSignal,
): Promise<PagedResult<OrderSummary>> {
  return apiClient.get<PagedResult<OrderSummary>>(
    `/api/orders${toSearchParams({
      search: filters.search,
      fromDate: filters.fromDate,
      toDate: filters.toDate,
      paymentMethod: filters.paymentMethod,
      orderType: filters.orderType,
      page: filters.page,
      pageSize: filters.pageSize,
    })}`,
    { signal },
  );
}
