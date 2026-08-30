"use client";

import type { ReactNode } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { PermissionDeniedState } from "@/components/shared/permission-denied-state";

type RequirePermissionProps = {
  permission?: string;
  anyPermission?: string[];
  children: ReactNode;
  fallback?: ReactNode;
};

export function RequirePermission({
  permission,
  anyPermission,
  children,
  fallback,
}: RequirePermissionProps) {
  const { can, isAuthenticated } = useAuth();
  const allowed = anyPermission?.length
    ? anyPermission.some((key) => can(key))
    : permission
      ? can(permission)
      : isAuthenticated;

  if (!isAuthenticated || !allowed) {
    return (
      fallback ?? (
        <PermissionDeniedState
          title="You don't have access"
          description="You are signed in, but you do not have permission to view this resource."
        />
      )
    );
  }

  return children;
}
