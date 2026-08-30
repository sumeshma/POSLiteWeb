import type { AuthUser, UserShift } from "@/types/auth";

/** Identity roles observed on UserResponseDto. Do not invent additional names. */
export const SYSTEM_IDENTITY_ROLES = ["Admin", "Employee"] as const;
export type SystemIdentityRole = (typeof SYSTEM_IDENTITY_ROLES)[number];

/** Verified against Swagger UserResponseDto. */
export type ShopUser = {
  id: string;
  email: string | null;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  role: string | null;
  isActive: boolean;
  phoneNumber: string | null;
  profileImageUrl: string | null;
  permissions: string[] | null;
  appRoleId: string | null;
  appRoleName: string | null;
  shift: UserShift | null;
  createdAt: string;
  updatedAt: string | null;
  isOnline: boolean;
};

/** Verified against Swagger PermissionDefinitionDto. */
export type PermissionDefinition = {
  key: string | null;
  label: string | null;
  group: string | null;
};

/** Verified against Swagger CreateUserRequestDto. */
export type CreateUserRequest = {
  email?: string | null;
  username?: string | null;
  password?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  role?: string | null;
  phoneNumber?: string | null;
  appRoleId?: string | null;
  shift?: UserShift | null;
  permissions?: string[] | null;
};

/** Verified against Swagger UpdateUserRequestDto. */
export type UpdateUserRequest = {
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  role?: string | null;
  isActive: boolean;
  newPassword?: string | null;
  phoneNumber?: string | null;
  appRoleId?: string | null;
  shift?: UserShift | null;
  permissions?: string[] | null;
};

/** Verified against Swagger UpdateProfileRequestDto. */
export type UpdateProfileRequest = {
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
};

/** Verified against Swagger ChangePasswordRequestDto. */
export type ChangePasswordRequest = {
  currentPassword?: string | null;
  newPassword?: string | null;
};

/** Verified against Swagger ForceLogoutRequestDto. */
export type ForceLogoutRequest = {
  reason?: string | null;
};

export function getShopUserDisplayName(user: ShopUser | null | undefined): string {
  if (!user) {
    return "User";
  }

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return fullName || user.username || user.email || "User";
}

export function toAuthUser(user: ShopUser): AuthUser {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    phoneNumber: user.phoneNumber,
    profileImageUrl: user.profileImageUrl,
    permissions: user.permissions,
    appRoleId: user.appRoleId,
    appRoleName: user.appRoleName,
    shift: user.shift,
  };
}
