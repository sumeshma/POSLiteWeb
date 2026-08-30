"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/config/query-keys";
import { createPurchase, getPurchase, listPurchases } from "@/services/purchases.service";
import type { CreatePurchaseRequest, PurchaseListFilters } from "@/types/purchase";

export function usePurchasesQuery(
  filters: PurchaseListFilters,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: queryKeys.purchases.list(filters),
    queryFn: ({ signal }) => listPurchases(filters, signal),
    enabled: options?.enabled ?? true,
  });
}

export function usePurchaseQuery(id: string | null) {
  return useQuery({
    queryKey: queryKeys.purchases.detail(id ?? ""),
    queryFn: ({ signal }) => getPurchase(id!, signal),
    enabled: Boolean(id),
  });
}

export function usePurchaseMutations() {
  const queryClient = useQueryClient();

  function invalidateAfterCreate() {
    void queryClient.invalidateQueries({ queryKey: queryKeys.purchases.all() });
    void queryClient.invalidateQueries({ queryKey: queryKeys.products.all() });
    void queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all() });
    void queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.all() });
    void queryClient.invalidateQueries({ queryKey: queryKeys.reports.all() });
  }

  const create = useMutation({
    mutationFn: (body: CreatePurchaseRequest) => createPurchase(body),
    onSuccess: invalidateAfterCreate,
  });

  return { create };
}
