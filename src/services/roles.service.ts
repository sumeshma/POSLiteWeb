import { apiClient } from "@/lib/api-client";
import type { AppRole, RoleRequest } from "@/types/role";

export async function listRoles(signal?: AbortSignal): Promise<AppRole[]> {
  return apiClient.get<AppRole[]>("/api/roles", { signal });
}

export async function listDeletedRoles(signal?: AbortSignal): Promise<AppRole[]> {
  return apiClient.get<AppRole[]>("/api/roles/deleted", { signal });
}

export async function getRole(id: string, signal?: AbortSignal): Promise<AppRole> {
  return apiClient.get<AppRole>(`/api/roles/${id}`, { signal });
}

export async function createRole(body: RoleRequest): Promise<AppRole> {
  return apiClient.post<AppRole>("/api/roles", body);
}

export async function updateRole(id: string, body: RoleRequest): Promise<AppRole> {
  return apiClient.put<AppRole>(`/api/roles/${id}`, body);
}

export async function deleteRole(id: string): Promise<void> {
  await apiClient.delete(`/api/roles/${id}`);
}

export async function restoreRole(id: string): Promise<void> {
  await apiClient.post(`/api/roles/${id}/restore`);
}
