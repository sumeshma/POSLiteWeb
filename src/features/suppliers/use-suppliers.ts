"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/config/query-keys";
import {
  createSupplier,
  deleteSupplier,
  getSupplier,
  listSuppliers,
  updateSupplier,
} from "@/services/suppliers.service";
import type {
  CreateSupplierRequest,
  SupplierListFilters,
  UpdateSupplierRequest,
} from "@/types/supplier";

export function useSuppliersQuery(filters: SupplierListFilters) {
  return useQuery({
    queryKey: queryKeys.suppliers.list(filters),
    queryFn: ({ signal }) => listSuppliers(filters, signal),
  });
}

export function useSupplierQuery(id: string | null) {
  return useQuery({
    queryKey: queryKeys.suppliers.detail(id ?? ""),
    queryFn: ({ signal }) => getSupplier(id!, signal),
    enabled: Boolean(id),
  });
}

export function useSupplierMutations() {
  const queryClient = useQueryClient();

  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.all() });
  }

  const create = useMutation({
    mutationFn: (body: CreateSupplierRequest) => createSupplier(body),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: (vars: { id: string; body: UpdateSupplierRequest }) =>
      updateSupplier(vars.id, vars.body),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteSupplier(id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
