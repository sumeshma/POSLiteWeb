/** Verified against Swagger UserShiftDto. */
export type UserShift = {
  shiftEnabled: boolean;
  shiftStartTime: string | null;
  shiftEndTime: string | null;
  workingDays: string | null;
  graceBeforeLoginMinutes: number;
  graceAfterShiftMinutes: number;
  allowLoginOutsideShift: boolean;
};

/** Verified against Swagger UserSummaryDto and login response. */
export type AuthUser = {
  id: string;
  email: string | null;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  role: string | null;
  phoneNumber: string | null;
  profileImageUrl: string | null;
  permissions: string[] | null;
  appRoleId: string | null;
  appRoleName: string | null;
  shift: UserShift | null;
};

/** Verified against Swagger SessionInfoDto. */
export type SessionInfo = {
  autoLogoutAt: string | null;
  shiftDisplay: string | null;
  attendanceId: string | null;
};

/** Verified against Swagger LoginResponseDto. */
export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
  user: AuthUser;
  session: SessionInfo | null;
};

export type SsoCompleteRequest = {
  code: string;
};

/**
 * POS Lite SSO complete payload. Same token/user shape as login, plus the
 * shop the opaque code was issued for. `sessionInfo` is accepted as an alias
 * of login's `session` field.
 */
export type SsoCompleteResponse = LoginResponse & {
  shopCode: string;
  shopDisplayName?: string | null;
  sessionInfo?: SessionInfo | null;
};

/** Verified against Swagger TokenResponseDto. */
export type TokenResponse = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
};

export type LoginRequest = {
  username: string;
  password: string;
  shopCode: string;
  loginDevice?: string;
};

/** Verified against Swagger ShopBrandingDto. */
export type ShopBranding = {
  appDisplayName: string | null;
  logoImageUrl: string | null;
};

export type PersistedSession = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
  shopCode: string;
  shopDisplayName?: string | null;
  user: AuthUser;
  sessionInfo?: SessionInfo | null;
  openedFrom?: "sso" | "password";
  returnTo?: string | null;
};

export function getUserDisplayName(user: AuthUser | null | undefined): string {
  if (!user) {
    return "User";
  }

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return fullName || user.username || user.email || "User";
}

export function getUserInitials(user: AuthUser | null | undefined): string {
  const name = getUserDisplayName(user);
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "U";
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}
