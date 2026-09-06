"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/config/query-keys";
import { getShopCode } from "@/lib/session";
import {
  getShopSettings,
  listUiPickups,
  updateShopSettings,
} from "@/services/shop-settings.service";
import type { UpdateShopSettingsRequest } from "@/types/billing";

export function useShopSettingsQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.shopSettings.current(),
    queryFn: ({ signal }) => getShopSettings(signal),
    enabled: options?.enabled ?? true,
  });
}

export function useUiPickupsQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.shopSettings.uiPickups(),
    queryFn: ({ signal }) => listUiPickups(signal),
    enabled: options?.enabled ?? true,
    staleTime: 5 * 60 * 1000,
  });
}

export function useShopSettingsMutations() {
  const queryClient = useQueryClient();

  const update = useMutation({
    mutationFn: (body: UpdateShopSettingsRequest) => updateShopSettings(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.shopSettings.all() });
      const shopCode = getShopCode();
      if (shopCode) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.shop.branding(shopCode) });
      }
    },
  });

  return { update };
}
