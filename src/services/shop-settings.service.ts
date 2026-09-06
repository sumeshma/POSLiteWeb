import { apiClient } from "@/lib/api-client";
import type { ShopSettings, UiPickupOption, UpdateShopSettingsRequest } from "@/types/billing";

export async function getShopSettings(signal?: AbortSignal): Promise<ShopSettings> {
  return apiClient.get<ShopSettings>("/api/ShopSettings", { signal });
}

export async function updateShopSettings(
  body: UpdateShopSettingsRequest,
): Promise<ShopSettings> {
  return apiClient.put<ShopSettings>("/api/ShopSettings", body);
}

export async function listUiPickups(signal?: AbortSignal): Promise<UiPickupOption[]> {
  const data = await apiClient.get<UiPickupOption[] | { items?: UiPickupOption[] }>(
    "/api/UiPickup",
    { signal },
  );
  if (Array.isArray(data)) {
    return data;
  }
  return data?.items ?? [];
}
