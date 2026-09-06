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
import { env } from "@/config/env";
import { queryKeys } from "@/config/query-keys";
import { isPublicAuthPath } from "@/lib/auth-paths";
import { hasPermission } from "@/lib/permissions";
import {
  clearSession,
  getServerSessionSnapshot,
  getSessionSnapshot,
  isCompleteAuthPayload,
  persistAuthSession,
  resolveShopDisplayName,
  subscribeSession,
  subscribeUnauthorized,
} from "@/lib/session";
import {
  completeSso as completeSsoRequest,
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
  completeSso: (code: string) => Promise<void>;
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
      if (!isPublicAuthPath(pathname)) {
        router.replace("/login?reason=session");
      }
    });
  }, [pathname, queryClient, router]);

  const persistShopSession = useCallback(
    async (data: Parameters<typeof persistAuthSession>[0]) => {
      const shopCode = data.shopCode.trim().toUpperCase();
      let brandingName: string | null = null;
      try {
        const branding = await getShopBranding(shopCode);
        brandingName = branding.appDisplayName;
      } catch {
        brandingName = null;
      }

      persistAuthSession({
        ...data,
        shopCode,
        shopDisplayName: resolveShopDisplayName(
          shopCode,
          data.shopDisplayName,
          brandingName,
        ),
      });
      queryClient.clear();
    },
    [queryClient],
  );

  const login = useCallback(
    async (input: LoginInput) => {
      const shopCode = input.shopCode.trim().toUpperCase();
      const data = await loginRequest({
        username: input.username.trim(),
        password: input.password,
        shopCode,
        loginDevice: appConfig.loginDevice,
      });

      await persistShopSession({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        accessTokenExpiresAt: data.accessTokenExpiresAt,
        refreshTokenExpiresAt: data.refreshTokenExpiresAt,
        shopCode,
        user: data.user,
        session: data.session,
      });
    },
    [persistShopSession],
  );

  const completeSso = useCallback(
    async (code: string) => {
      // Drop any previous POS Lite shop session first. Otherwise Open Workspace
      // keeps the last password-login shop (tokens, X-Shop-Code, React Query).
      clearSession();
      queryClient.clear();

      const data = await completeSsoRequest({ code });
      if (!isCompleteAuthPayload(data)) {
        throw new Error("SSO_INCOMPLETE");
      }

      await persistShopSession({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        accessTokenExpiresAt: data.accessTokenExpiresAt,
        refreshTokenExpiresAt: data.refreshTokenExpiresAt,
        shopCode: data.shopCode,
        shopDisplayName: data.shopDisplayName ?? null,
        user: data.user,
        session: data.session,
        sessionInfo: data.sessionInfo,
      });
    },
    [persistShopSession, queryClient],
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
      if (env.auralizzHomeUrl) {
        window.location.assign(env.auralizzHomeUrl);
        return;
      }
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
      completeSso,
      logout,
      can,
    }),
    [can, completeSso, isReady, login, logout, session],
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
