import { apiClient } from "@/lib/api-client";
import { toSearchParams } from "@/lib/search-params";
import type {
  Category,
  CategoryListFilters,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "@/types/category";

export async function listCategories(
  filters: CategoryListFilters = {},
  signal?: AbortSignal,
): Promise<Category[]> {
  return apiClient.get<Category[]>(
    `/api/categories${toSearchParams({ search: filters.search })}`,
    { signal },
  );
}

export async function getCategory(id: string, signal?: AbortSignal): Promise<Category> {
  return apiClient.get<Category>(`/api/categories/${id}`, { signal });
}

export async function createCategory(body: CreateCategoryRequest): Promise<Category> {
  return apiClient.post<Category>("/api/categories", body);
}

export async function updateCategory(
  id: string,
  body: UpdateCategoryRequest,
): Promise<Category> {
  return apiClient.put<Category>(`/api/categories/${id}`, body);
}

export async function deleteCategory(id: string): Promise<void> {
  await apiClient.delete(`/api/categories/${id}`);
}
