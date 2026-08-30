export const ADMIN_ROLE = "Admin";

export function isAdmin(role?: string | null): boolean {
  return role === ADMIN_ROLE;
}

export function hasPermission(
  permission: string,
  permissions: string[] = [],
  role?: string | null,
): boolean {
  if (isAdmin(role)) {
    return true;
  }

  return permissions.includes(permission);
}

export function hasAnyPermission(
  required: string[],
  permissions: string[] = [],
  role?: string | null,
): boolean {
  if (required.length === 0) {
    return true;
  }

  return required.some((permission) => hasPermission(permission, permissions, role));
}
