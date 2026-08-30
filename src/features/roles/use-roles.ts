"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/config/query-keys";
import {
  createRole,
  deleteRole,
  getRole,
  listDeletedRoles,
  listRoles,
  restoreRole,
  updateRole,
} from "@/services/roles.service";
import type { RoleRequest } from "@/types/role";

export function useRolesQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.roles.list(),
    queryFn: ({ signal }) => listRoles(signal),
    enabled: options?.enabled ?? true,
  });
}

export function useDeletedRolesQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.roles.deleted(),
    queryFn: ({ signal }) => listDeletedRoles(signal),
    enabled: options?.enabled ?? true,
  });
}

export function useRoleQuery(id: string | null) {
  return useQuery({
    queryKey: queryKeys.roles.detail(id ?? ""),
    queryFn: ({ signal }) => getRole(id!, signal),
    enabled: Boolean(id),
  });
}

export function useRoleMutations() {
  const queryClient = useQueryClient();

  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: queryKeys.roles.all() });
    void queryClient.invalidateQueries({ queryKey: queryKeys.users.all() });
  }

  const create = useMutation({
    mutationFn: (body: RoleRequest) => createRole(body),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: (vars: { id: string; body: RoleRequest }) => updateRole(vars.id, vars.body),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteRole(id),
    onSuccess: invalidate,
  });

  const restore = useMutation({
    mutationFn: (id: string) => restoreRole(id),
    onSuccess: invalidate,
  });

  return { create, update, remove, restore };
}
