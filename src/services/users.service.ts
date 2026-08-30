import { apiClient } from "@/lib/api-client";
import type {
  ChangePasswordRequest,
  CreateUserRequest,
  ForceLogoutRequest,
  PermissionDefinition,
  ShopUser,
  UpdateProfileRequest,
  UpdateUserRequest,
} from "@/types/user";

export async function listUsers(signal?: AbortSignal): Promise<ShopUser[]> {
  return apiClient.get<ShopUser[]>("/api/users", { signal });
}

export async function listDeletedUsers(signal?: AbortSignal): Promise<ShopUser[]> {
  return apiClient.get<ShopUser[]>("/api/users/deleted", { signal });
}

export async function getUser(id: string, signal?: AbortSignal): Promise<ShopUser> {
  return apiClient.get<ShopUser>(`/api/users/${id}`, { signal });
}

export async function getCurrentUser(signal?: AbortSignal): Promise<ShopUser> {
  return apiClient.get<ShopUser>("/api/users/me", { signal });
}

export async function listPermissionCatalog(
  signal?: AbortSignal,
): Promise<PermissionDefinition[]> {
  return apiClient.get<PermissionDefinition[]>("/api/users/permissions", { signal });
}

export async function createUser(body: CreateUserRequest): Promise<ShopUser> {
  return apiClient.post<ShopUser>("/api/users", body);
}

export async function updateUser(id: string, body: UpdateUserRequest): Promise<ShopUser> {
  return apiClient.put<ShopUser>(`/api/users/${id}`, body);
}

export async function deleteUser(id: string): Promise<void> {
  await apiClient.delete(`/api/users/${id}`);
}

export async function restoreUser(id: string): Promise<void> {
  await apiClient.post(`/api/users/${id}/restore`);
}

export async function forceLogoutUser(id: string, body?: ForceLogoutRequest): Promise<void> {
  await apiClient.post(`/api/users/${id}/force-logout`, body ?? {});
}

export async function updateCurrentUserProfile(
  body: UpdateProfileRequest,
): Promise<ShopUser> {
  return apiClient.put<ShopUser>("/api/users/me", body);
}

export async function changeCurrentUserPassword(body: ChangePasswordRequest): Promise<void> {
  await apiClient.put("/api/users/me/password", body);
}
