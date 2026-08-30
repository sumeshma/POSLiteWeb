import { apiClient } from "@/lib/api-client";
import { toSearchParams } from "@/lib/search-params";
import type {
  CreateProductRequest,
  Product,
  ProductListFilters,
  UpdateProductRequest,
} from "@/types/product";

export async function listProducts(
  filters: ProductListFilters = {},
  signal?: AbortSignal,
): Promise<Product[]> {
  return apiClient.get<Product[]>(
    `/api/products${toSearchParams({
      search: filters.search,
      categoryId: filters.categoryId,
      isActive: filters.isActive,
      showOnPos: filters.showOnPos,
    })}`,
    { signal },
  );
}

export async function getProduct(id: string, signal?: AbortSignal): Promise<Product> {
  return apiClient.get<Product>(`/api/products/${id}`, { signal });
}

export async function createProduct(body: CreateProductRequest): Promise<Product> {
  return apiClient.post<Product>("/api/products", body);
}

export async function updateProduct(
  id: string,
  body: UpdateProductRequest,
): Promise<Product> {
  return apiClient.put<Product>(`/api/products/${id}`, body);
}

export async function deleteProduct(id: string): Promise<void> {
  await apiClient.delete(`/api/products/${id}`);
}
