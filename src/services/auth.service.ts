import { apiClient } from "@/lib/api-client";
import type {
  AuthUser,
  LoginRequest,
  LoginResponse,
  ShopBranding,
  TokenResponse,
} from "@/types/auth";

export async function login(request: LoginRequest): Promise<LoginResponse> {
  return apiClient.post<LoginResponse>("/api/auth/login", request, {
    skipAuth: true,
    skipRefresh: true,
    shopCode: request.shopCode,
  });
}

export async function refreshTokens(refreshToken: string): Promise<TokenResponse> {
  return apiClient.post<TokenResponse>(
    "/api/auth/refresh",
    { refreshToken },
    {
      skipAuth: true,
      skipRefresh: true,
    },
  );
}

export async function logoutCurrentSession(refreshToken: string): Promise<void> {
  await apiClient.post(
    "/api/auth/logout",
    { refreshToken },
    {
      skipRefresh: true,
    },
  );
}

export async function getCurrentUser(): Promise<AuthUser> {
  return apiClient.get<AuthUser>("/api/users/me");
}

export async function getShopBranding(shopCode: string): Promise<ShopBranding> {
  return apiClient.get<ShopBranding>("/api/ShopSettings/branding", {
    skipAuth: true,
    skipRefresh: true,
    shopCode,
  });
}
