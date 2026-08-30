"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/config/query-keys";
import {
  cancelHold,
  checkout,
  createHold,
  getActiveHoldCount,
  listHolds,
  recordBillPrint,
  resumeHold,
} from "@/services/billing.service";
import { getShopSettings } from "@/services/shop-settings.service";
import type { CheckoutRequest, HoldOrderRequest } from "@/types/billing";

export function useShopSettingsQuery() {
  return useQuery({
    queryKey: queryKeys.shopSettings.current(),
    queryFn: ({ signal }) => getShopSettings(signal),
  });
}

export function useHoldsQuery(search?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.holds.list(search),
    queryFn: ({ signal }) => listHolds(search, signal),
    enabled: options?.enabled ?? true,
  });
}

export function useActiveHoldCountQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.holds.activeCount(),
    queryFn: ({ signal }) => getActiveHoldCount(signal),
    enabled: options?.enabled ?? true,
  });
}

export function usePosMutations() {
  const queryClient = useQueryClient();

  function invalidateAfterSale() {
    void queryClient.invalidateQueries({ queryKey: queryKeys.products.all() });
    void queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all() });
    void queryClient.invalidateQueries({ queryKey: queryKeys.billing.all() });
    void queryClient.invalidateQueries({ queryKey: queryKeys.holds.all() });
    void queryClient.invalidateQueries({ queryKey: queryKeys.reports.all() });
    void queryClient.invalidateQueries({ queryKey: queryKeys.orders.all() });
  }

  function invalidateHolds() {
    void queryClient.invalidateQueries({ queryKey: queryKeys.holds.all() });
  }

  const checkoutSale = useMutation({
    mutationFn: (body: CheckoutRequest) => checkout(body),
    onSuccess: invalidateAfterSale,
  });

  const hold = useMutation({
    mutationFn: (body: HoldOrderRequest) => createHold(body),
    onSuccess: invalidateHolds,
  });

  const resume = useMutation({
    mutationFn: (id: string) => resumeHold(id),
    onSuccess: invalidateHolds,
  });

  const cancel = useMutation({
    mutationFn: (id: string) => cancelHold(id),
    onSuccess: invalidateHolds,
  });

  const print = useMutation({
    mutationFn: (id: string) => recordBillPrint(id),
  });

  return { checkoutSale, hold, resume, cancel, print };
}
