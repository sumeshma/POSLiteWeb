"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/config/query-keys";
import {
  createProduct,
  deleteProduct,
  getProduct,
  listProducts,
  updateProduct,
} from "@/services/products.service";
import type {
  CreateProductRequest,
  ProductListFilters,
  UpdateProductRequest,
} from "@/types/product";

export function useProductsQuery(
  filters: ProductListFilters,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: queryKeys.products.list(filters),
    queryFn: ({ signal }) => listProducts(filters, signal),
    enabled: options?.enabled ?? true,
  });
}

export function useProductQuery(id: string | null) {
  return useQuery({
    queryKey: queryKeys.products.detail(id ?? ""),
    queryFn: ({ signal }) => getProduct(id!, signal),
    enabled: Boolean(id),
  });
}

export function useProductMutations() {
  const queryClient = useQueryClient();

  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: queryKeys.products.all() });
    void queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all() });
  }

  const create = useMutation({
    mutationFn: (body: CreateProductRequest) => createProduct(body),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: (vars: { id: string; body: UpdateProductRequest }) =>
      updateProduct(vars.id, vars.body),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
