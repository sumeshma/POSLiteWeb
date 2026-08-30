"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/config/query-keys";
import {
  changeCurrentUserPassword,
  createUser,
  deleteUser,
  forceLogoutUser,
  getCurrentUser,
  getUser,
  listDeletedUsers,
  listPermissionCatalog,
  listUsers,
  restoreUser,
  updateCurrentUserProfile,
  updateUser,
} from "@/services/users.service";
import type {
  ChangePasswordRequest,
  CreateUserRequest,
  ForceLogoutRequest,
  UpdateProfileRequest,
  UpdateUserRequest,
} from "@/types/user";

export function useUsersQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.users.list(),
    queryFn: ({ signal }) => listUsers(signal),
    enabled: options?.enabled ?? true,
  });
}

export function useDeletedUsersQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.users.deleted(),
    queryFn: ({ signal }) => listDeletedUsers(signal),
    enabled: options?.enabled ?? true,
  });
}

export function useUserQuery(id: string | null) {
  return useQuery({
    queryKey: queryKeys.users.detail(id ?? ""),
    queryFn: ({ signal }) => getUser(id!, signal),
    enabled: Boolean(id),
  });
}

export function useCurrentUserQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.users.me(),
    queryFn: ({ signal }) => getCurrentUser(signal),
    enabled: options?.enabled ?? true,
  });
}

export function usePermissionCatalogQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.users.permissions(),
    queryFn: ({ signal }) => listPermissionCatalog(signal),
    enabled: options?.enabled ?? true,
  });
}

export function useUserMutations() {
  const queryClient = useQueryClient();

  function invalidateUsers() {
    void queryClient.invalidateQueries({ queryKey: queryKeys.users.all() });
    void queryClient.invalidateQueries({ queryKey: queryKeys.roles.all() });
    void queryClient.invalidateQueries({ queryKey: queryKeys.attendance.all() });
  }

  const create = useMutation({
    mutationFn: (body: CreateUserRequest) => createUser(body),
    onSuccess: invalidateUsers,
  });

  const update = useMutation({
    mutationFn: (vars: { id: string; body: UpdateUserRequest }) =>
      updateUser(vars.id, vars.body),
    onSuccess: invalidateUsers,
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: invalidateUsers,
  });

  const restore = useMutation({
    mutationFn: (id: string) => restoreUser(id),
    onSuccess: invalidateUsers,
  });

  const forceLogout = useMutation({
    mutationFn: (vars: { id: string; body?: ForceLogoutRequest }) =>
      forceLogoutUser(vars.id, vars.body),
    onSuccess: invalidateUsers,
  });

  return { create, update, remove, restore, forceLogout };
}

export function useProfileMutations() {
  const queryClient = useQueryClient();

  const updateProfile = useMutation({
    mutationFn: (body: UpdateProfileRequest) => updateCurrentUserProfile(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.all() });
    },
  });

  const changePassword = useMutation({
    mutationFn: (body: ChangePasswordRequest) => changeCurrentUserPassword(body),
  });

  return { updateProfile, changePassword };
}
