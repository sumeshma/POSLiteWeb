import { apiClient } from "@/lib/api-client";
import { toSearchParams } from "@/lib/search-params";
import type { PagedResult } from "@/types/api";
import type {
  CreateCustomerRequest,
  Customer,
  CustomerListFilters,
  UpdateCustomerRequest,
} from "@/types/customer";

export async function listCustomers(
  filters: CustomerListFilters,
  signal?: AbortSignal,
): Promise<PagedResult<Customer>> {
  return apiClient.get<PagedResult<Customer>>(
    `/api/customers${toSearchParams({
      search: filters.search,
      isActive: filters.isActive,
      page: filters.page,
      pageSize: filters.pageSize,
    })}`,
    { signal },
  );
}

export async function lookupCustomerByPhone(
  phone: string,
  signal?: AbortSignal,
): Promise<Customer | null> {
  return apiClient.get<Customer | null>(
    `/api/customers/lookup${toSearchParams({ phone })}`,
    { signal },
  );
}

export async function getCustomer(id: string, signal?: AbortSignal): Promise<Customer> {
  return apiClient.get<Customer>(`/api/customers/${id}`, { signal });
}

export async function createCustomer(body: CreateCustomerRequest): Promise<Customer> {
  return apiClient.post<Customer>("/api/customers", body);
}

export async function updateCustomer(
  id: string,
  body: UpdateCustomerRequest,
): Promise<Customer> {
  return apiClient.put<Customer>(`/api/customers/${id}`, body);
}
