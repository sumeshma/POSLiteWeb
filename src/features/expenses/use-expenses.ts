"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/config/query-keys";
import {
  createExpense,
  deleteExpense,
  getExpense,
  listDeletedExpenses,
  listExpenseCategories,
  listExpenses,
  restoreExpense,
  updateExpense,
} from "@/services/expenses.service";
import type {
  CreateExpenseRequest,
  ExpenseListFilters,
  UpdateExpenseRequest,
} from "@/types/expense";

export function useExpensesQuery(
  filters: ExpenseListFilters,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: queryKeys.expenses.list(filters),
    queryFn: ({ signal }) => listExpenses(filters, signal),
    enabled: options?.enabled ?? true,
  });
}

export function useExpenseQuery(id: string | null) {
  return useQuery({
    queryKey: queryKeys.expenses.detail(id ?? ""),
    queryFn: ({ signal }) => getExpense(id!, signal),
    enabled: Boolean(id),
  });
}

export function useExpenseCategoriesQuery() {
  return useQuery({
    queryKey: queryKeys.expenses.categories(),
    queryFn: ({ signal }) => listExpenseCategories(signal),
  });
}

export function useDeletedExpensesQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.expenses.deleted(),
    queryFn: ({ signal }) => listDeletedExpenses(signal),
    enabled: options?.enabled ?? true,
  });
}

export function useExpenseMutations() {
  const queryClient = useQueryClient();

  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all() });
    void queryClient.invalidateQueries({ queryKey: queryKeys.reports.all() });
  }

  const create = useMutation({
    mutationFn: (body: CreateExpenseRequest) => createExpense(body),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: (vars: { id: string; body: UpdateExpenseRequest }) =>
      updateExpense(vars.id, vars.body),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteExpense(id),
    onSuccess: invalidate,
  });

  const restore = useMutation({
    mutationFn: (id: string) => restoreExpense(id),
    onSuccess: invalidate,
  });

  return { create, update, remove, restore };
}
