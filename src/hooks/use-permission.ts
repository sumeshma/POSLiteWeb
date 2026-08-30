"use client";

import { useAuth } from "@/components/auth/auth-provider";

export function usePermission(permission: string): boolean {
  const { can } = useAuth();
  return can(permission);
}
