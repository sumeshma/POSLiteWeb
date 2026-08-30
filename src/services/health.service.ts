import { apiClient } from "@/lib/api-client";
import type { HealthStatus } from "@/types/api";

export async function getHealth(signal?: AbortSignal): Promise<HealthStatus> {
  return apiClient.get<HealthStatus>("/health", {
    skipAuth: true,
    skipShopCode: true,
    unwrap: false,
    signal,
  });
}
