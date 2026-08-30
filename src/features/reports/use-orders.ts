"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/config/query-keys";
import { listOrders } from "@/services/orders.service";
import type { OrderListFilters } from "@/types/order";

export function useOrdersQuery(
  filters: OrderListFilters,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: queryKeys.orders.list(filters),
    queryFn: ({ signal }) => listOrders(filters, signal),
    enabled: options?.enabled ?? true,
  });
}
