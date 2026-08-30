import { apiClient } from "@/lib/api-client";
import { toSearchParams } from "@/lib/search-params";
import type {
  Bill,
  CheckoutRequest,
  HoldOrder,
  HoldOrderRequest,
} from "@/types/billing";

export async function checkout(body: CheckoutRequest): Promise<Bill> {
  return apiClient.post<Bill>("/api/billing/checkout", body);
}

export async function getBill(id: string, signal?: AbortSignal): Promise<Bill> {
  return apiClient.get<Bill>(`/api/billing/${id}`, { signal });
}

export async function recordBillPrint(id: string): Promise<Bill> {
  return apiClient.post<Bill>(`/api/billing/${id}/record-print`);
}

export async function listHolds(
  search?: string,
  signal?: AbortSignal,
): Promise<HoldOrder[]> {
  return apiClient.get<HoldOrder[]>(
    `/api/billing/holds${toSearchParams({ search })}`,
    { signal },
  );
}

export async function getActiveHoldCount(signal?: AbortSignal): Promise<number> {
  return apiClient.get<number>("/api/billing/holds/active-count", { signal });
}

export async function createHold(body: HoldOrderRequest): Promise<HoldOrder> {
  return apiClient.post<HoldOrder>("/api/billing/holds", body);
}

export async function resumeHold(id: string): Promise<HoldOrder> {
  return apiClient.post<HoldOrder>(`/api/billing/holds/${id}/resume`);
}

export async function cancelHold(id: string): Promise<HoldOrder> {
  return apiClient.post<HoldOrder>(`/api/billing/holds/${id}/cancel`);
}
