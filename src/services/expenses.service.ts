import { apiClient } from "@/lib/api-client";
import { toSearchParams } from "@/lib/search-params";
import type { PagedResult } from "@/types/api";
import type {
  CreateExpenseRequest,
  Expense,
  ExpenseListFilters,
  UpdateExpenseRequest,
} from "@/types/expense";

export async function listExpenses(
  filters: ExpenseListFilters,
  signal?: AbortSignal,
): Promise<PagedResult<Expense>> {
  return apiClient.get<PagedResult<Expense>>(
    `/api/expenses${toSearchParams({
      search: filters.search,
      category: filters.category,
      fromDate: filters.fromDate,
      toDate: filters.toDate,
      page: filters.page,
      pageSize: filters.pageSize,
    })}`,
    { signal },
  );
}

export async function listExpenseCategories(signal?: AbortSignal): Promise<string[]> {
  return apiClient.get<string[]>("/api/expenses/categories", { signal });
}

export async function listDeletedExpenses(signal?: AbortSignal): Promise<Expense[]> {
  const data = await apiClient.get<Expense[] | PagedResult<Expense>>(
    "/api/expenses/deleted",
    { signal },
  );
  if (Array.isArray(data)) {
    return data;
  }
  return data.items ?? [];
}

export async function getExpense(id: string, signal?: AbortSignal): Promise<Expense> {
  return apiClient.get<Expense>(`/api/expenses/${id}`, { signal });
}

export async function createExpense(body: CreateExpenseRequest): Promise<Expense> {
  return apiClient.post<Expense>("/api/expenses", body);
}

export async function updateExpense(
  id: string,
  body: UpdateExpenseRequest,
): Promise<Expense> {
  return apiClient.put<Expense>(`/api/expenses/${id}`, body);
}

export async function deleteExpense(id: string): Promise<void> {
  await apiClient.delete(`/api/expenses/${id}`);
}

export async function restoreExpense(id: string): Promise<Expense> {
  return apiClient.post<Expense>(`/api/expenses/${id}/restore`);
}
