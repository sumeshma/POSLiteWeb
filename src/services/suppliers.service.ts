import { apiClient } from "@/lib/api-client";
import { toSearchParams } from "@/lib/search-params";
import type {
  CreateSupplierRequest,
  Supplier,
  SupplierListFilters,
  UpdateSupplierRequest,
} from "@/types/supplier";

export async function listSuppliers(
  filters: SupplierListFilters = {},
  signal?: AbortSignal,
): Promise<Supplier[]> {
  return apiClient.get<Supplier[]>(
    `/api/suppliers${toSearchParams({
      search: filters.search,
      isActive: filters.isActive,
    })}`,
    { signal },
  );
}

export async function getSupplier(id: string, signal?: AbortSignal): Promise<Supplier> {
  return apiClient.get<Supplier>(`/api/suppliers/${id}`, { signal });
}

export async function createSupplier(body: CreateSupplierRequest): Promise<Supplier> {
  return apiClient.post<Supplier>("/api/suppliers", body);
}

export async function updateSupplier(
  id: string,
  body: UpdateSupplierRequest,
): Promise<Supplier> {
  return apiClient.put<Supplier>(`/api/suppliers/${id}`, body);
}

export async function deleteSupplier(id: string): Promise<void> {
  await apiClient.delete(`/api/suppliers/${id}`);
}
