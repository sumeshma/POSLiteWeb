"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { appConfig } from "@/config/app";
import { queryKeys } from "@/config/query-keys";
import { hasPermission } from "@/lib/permissions";
import {
  clearSession,
  getServerSessionSnapshot,
  getSessionSnapshot,
  subscribeSession,
  subscribeUnauthorized,
  writeSession,
} from "@/lib/session";
import {
  getShopBranding,
  login as loginRequest,
  logoutCurrentSession,
} from "@/services/auth.service";
import type { AuthUser, PersistedSession } from "@/types/auth";

function parseSession(raw: string | null): PersistedSession | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as PersistedSession;
    if (!parsed.accessToken || !parsed.shopCode || !parsed.user) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function useHasHydrated(): boolean {
  return useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
}

export type LoginInput = {
  shopCode: string;
  username: string;
  password: string;
};

type AuthContextValue = {
  session: PersistedSession | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (input: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
  can: (permission: string) => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const isReady = useHasHydrated();
  const rawSession = useSyncExternalStore(
    subscribeSession,
    getSessionSnapshot,
    getServerSessionSnapshot,
  );
  const session = useMemo(() => parseSession(rawSession), [rawSession]);

  useEffect(() => {
    return subscribeUnauthorized(() => {
      queryClient.removeQueries({ queryKey: queryKeys.auth.all() });
      queryClient.clear();
      if (!pathname.startsWith("/login")) {
        router.replace("/login?reason=session");
      }
    });
  }, [pathname, queryClient, router]);

  const login = useCallback(
    async (input: LoginInput) => {
      const shopCode = input.shopCode.trim().toUpperCase();
      const data = await loginRequest({
        username: input.username.trim(),
        password: input.password,
        shopCode,
        loginDevice: appConfig.loginDevice,
      });

      let shopDisplayName: string | null = null;
      try {
        const branding = await getShopBranding(shopCode);
        shopDisplayName = branding.appDisplayName;
      } catch {
        shopDisplayName = null;
      }

      writeSession({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        accessTokenExpiresAt: data.accessTokenExpiresAt,
        refreshTokenExpiresAt: data.refreshTokenExpiresAt,
        shopCode,
        shopDisplayName,
        user: data.user,
        sessionInfo: data.session,
      });

      queryClient.clear();
    },
    [queryClient],
  );

  const logout = useCallback(async () => {
    const refreshToken = session?.refreshToken;
    try {
      if (refreshToken) {
        await logoutCurrentSession(refreshToken);
      }
    } catch {
      // Always clear the local session, even if the API logout call fails.
    } finally {
      clearSession();
      queryClient.clear();
      router.replace("/login");
    }
  }, [queryClient, router, session?.refreshToken]);

  const can = useCallback(
    (permission: string) =>
      hasPermission(permission, session?.user.permissions ?? [], session?.user.role),
    [session],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      isAuthenticated: Boolean(session),
      isReady,
      login,
      logout,
      can,
    }),
    [can, isReady, login, logout, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }
  return context;
}
