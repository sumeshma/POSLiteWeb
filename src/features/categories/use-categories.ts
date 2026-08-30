"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/config/query-keys";
import {
  createCategory,
  deleteCategory,
  getCategory,
  listCategories,
  updateCategory,
} from "@/services/categories.service";
import type {
  CategoryListFilters,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "@/types/category";

export function useCategoriesQuery(filters: CategoryListFilters) {
  return useQuery({
    queryKey: queryKeys.categories.list(filters),
    queryFn: ({ signal }) => listCategories(filters, signal),
  });
}

export function useCategoryQuery(id: string | null) {
  return useQuery({
    queryKey: queryKeys.categories.detail(id ?? ""),
    queryFn: ({ signal }) => getCategory(id!, signal),
    enabled: Boolean(id),
  });
}

export function useCategoryMutations() {
  const queryClient = useQueryClient();

  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: queryKeys.categories.all() });
    void queryClient.invalidateQueries({ queryKey: queryKeys.products.all() });
  }

  const create = useMutation({
    mutationFn: (body: CreateCategoryRequest) => createCategory(body),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: (vars: { id: string; body: UpdateCategoryRequest }) =>
      updateCategory(vars.id, vars.body),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
