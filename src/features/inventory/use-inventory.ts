"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/config/query-keys";
import {
  createStockMovement,
  getInventoryDashboard,
  getLowStockCount,
  listLowStock,
  listStockMovements,
} from "@/services/inventory.service";
import type {
  CreateStockMovementRequest,
  LowStockFilters,
  StockMovementFilters,
} from "@/types/inventory";

export function useInventoryDashboardQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.inventory.dashboard(),
    queryFn: ({ signal }) => getInventoryDashboard(signal),
    enabled: options?.enabled ?? true,
  });
}

export function useLowStockCountQuery() {
  return useQuery({
    queryKey: queryKeys.inventory.lowStockCount(),
    queryFn: ({ signal }) => getLowStockCount(signal),
  });
}

export function useLowStockQuery(
  filters: LowStockFilters,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: queryKeys.inventory.lowStock(filters),
    queryFn: ({ signal }) => listLowStock(filters, signal),
    enabled: options?.enabled ?? true,
  });
}

export function useStockMovementsQuery(
  filters: StockMovementFilters,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: queryKeys.inventory.movements(filters),
    queryFn: ({ signal }) => listStockMovements(filters, signal),
    enabled: options?.enabled ?? true,
  });
}

export function useCreateStockMovement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateStockMovementRequest) => createStockMovement(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.all() });
    },
  });
}
