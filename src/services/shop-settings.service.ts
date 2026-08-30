import { apiClient } from "@/lib/api-client";
import type { ShopSettings } from "@/types/billing";

export async function getShopSettings(signal?: AbortSignal): Promise<ShopSettings> {
  return apiClient.get<ShopSettings>("/api/ShopSettings", { signal });
}
