"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/config/query-keys";
import {
  createCustomer,
  getCustomer,
  listCustomers,
  updateCustomer,
} from "@/services/customers.service";
import type {
  CreateCustomerRequest,
  CustomerListFilters,
  UpdateCustomerRequest,
} from "@/types/customer";

export function useCustomersQuery(
  filters: CustomerListFilters,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: queryKeys.customers.list(filters),
    queryFn: ({ signal }) => listCustomers(filters, signal),
    enabled: options?.enabled ?? true,
  });
}

export function useCustomerQuery(id: string | null) {
  return useQuery({
    queryKey: queryKeys.customers.detail(id ?? ""),
    queryFn: ({ signal }) => getCustomer(id!, signal),
    enabled: Boolean(id),
  });
}

export function useCustomerMutations() {
  const queryClient = useQueryClient();

  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: queryKeys.customers.all() });
  }

  const create = useMutation({
    mutationFn: (body: CreateCustomerRequest) => createCustomer(body),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: (vars: { id: string; body: UpdateCustomerRequest }) =>
      updateCustomer(vars.id, vars.body),
    onSuccess: invalidate,
  });

  return { create, update };
}
