import type { AuthTokenPair } from "@/types/api";
import type { AuthUser, PersistedSession, SessionInfo } from "@/types/auth";

const SESSION_KEY = "poslite.session";
const LAST_SHOP_CODE_KEY = "poslite.lastShopCode";
const LEGACY_KEYS = ["poslite.accessToken", "poslite.refreshToken", "poslite.shopCode"];

/** Default BusinessName seeded into every new POS Lite shop database. */
const SEEDED_SHOP_DISPLAY_NAME = "Auralizz Juice Shop";

export function resolveShopDisplayName(
  shopCode: string,
  ...candidates: Array<string | null | undefined>
): string {
  const code = shopCode.trim().toUpperCase();
  for (const candidate of candidates) {
    const value = candidate?.trim();
    if (
      value &&
      value.toLowerCase() !== SEEDED_SHOP_DISPLAY_NAME.toLowerCase()
    ) {
      return value;
    }
  }
  return code;
}

export function formatShopSessionLabel(
  shopCode: string | null | undefined,
  shopDisplayName?: string | null,
): string | null {
  const code = shopCode?.trim();
  if (!code) {
    return null;
  }

  const name = shopDisplayName?.trim();
  if (name && name.toUpperCase() !== code.toUpperCase()) {
    return `${name} · ${code}`;
  }

  return code;
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

let snapshotCache: string | null | undefined;

function emitSessionChange(): void {
  snapshotCache = undefined;
  if (!isBrowser()) {
    return;
  }
  window.dispatchEvent(new Event("poslite-session-changed"));
}

function clearLegacyKeys(): void {
  if (!isBrowser()) {
    return;
  }
  LEGACY_KEYS.forEach((key) => window.localStorage.removeItem(key));
}

export function readSession(): PersistedSession | null {
  if (!isBrowser()) {
    return null;
  }

  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as PersistedSession;
    if (!parsed.accessToken || !parsed.refreshToken || !parsed.shopCode || !parsed.user) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function writeSession(session: PersistedSession): void {
  if (!isBrowser()) {
    return;
  }

  clearLegacyKeys();
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  window.localStorage.setItem(LAST_SHOP_CODE_KEY, session.shopCode);
  emitSessionChange();
}

type AuthSessionPayload = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
  user: AuthUser;
  shopCode: string;
  shopDisplayName?: string | null;
  session?: SessionInfo | null;
  sessionInfo?: SessionInfo | null;
};

export function isCompleteAuthPayload(
  data: Partial<AuthSessionPayload> | null | undefined,
): data is AuthSessionPayload {
  return Boolean(
    data?.accessToken &&
      data.refreshToken &&
      data.accessTokenExpiresAt &&
      data.refreshTokenExpiresAt &&
      data.user &&
      data.shopCode?.trim(),
  );
}

/** Writes the same persisted session shape used by password login. */
export function persistAuthSession(data: AuthSessionPayload): void {
  writeSession({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    accessTokenExpiresAt: data.accessTokenExpiresAt,
    refreshTokenExpiresAt: data.refreshTokenExpiresAt,
    shopCode: data.shopCode.trim().toUpperCase(),
    shopDisplayName: data.shopDisplayName ?? null,
    user: data.user,
    sessionInfo: data.sessionInfo ?? data.session ?? null,
  });
}

export function clearSession(): void {
  if (!isBrowser()) {
    return;
  }

  clearLegacyKeys();
  window.localStorage.removeItem(SESSION_KEY);
  window.localStorage.removeItem(LAST_SHOP_CODE_KEY);
  emitSessionChange();
}

export function getAccessToken(): string | null {
  return readSession()?.accessToken ?? null;
}

export function getRefreshToken(): string | null {
  return readSession()?.refreshToken ?? null;
}

export function getShopCode(): string | null {
  return readSession()?.shopCode ?? null;
}

export function getLastShopCode(): string {
  if (!isBrowser()) {
    return "";
  }
  return window.localStorage.getItem(LAST_SHOP_CODE_KEY) ?? "";
}

export function updateSessionTokens(tokens: AuthTokenPair): void {
  const current = readSession();
  if (!current) {
    return;
  }

  writeSession({
    ...current,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    accessTokenExpiresAt: tokens.accessTokenExpiresAt ?? current.accessTokenExpiresAt,
    refreshTokenExpiresAt: tokens.refreshTokenExpiresAt ?? current.refreshTokenExpiresAt,
  });
}

export function updateSessionUser(user: AuthUser): void {
  const current = readSession();
  if (!current) {
    return;
  }

  writeSession({
    ...current,
    user,
  });
}

export function updateSessionShopProfile(shopDisplayName: string | null | undefined): void {
  const current = readSession();
  if (!current) {
    return;
  }

  writeSession({
    ...current,
    shopDisplayName: shopDisplayName ?? current.shopDisplayName,
  });
}

export function subscribeSession(onStoreChange: () => void): () => void {
  if (!isBrowser()) {
    return () => undefined;
  }

  const handler = () => onStoreChange();
  window.addEventListener("poslite-session-changed", handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener("poslite-session-changed", handler);
    window.removeEventListener("storage", handler);
  };
}

export function getSessionSnapshot(): string | null {
  if (!isBrowser()) {
    return null;
  }
  if (snapshotCache === undefined) {
    snapshotCache = window.localStorage.getItem(SESSION_KEY);
  }
  return snapshotCache;
}

export function getServerSessionSnapshot(): string | null {
  return null;
}

const unauthorizedListeners = new Set<() => void>();

export function subscribeUnauthorized(listener: () => void): () => void {
  unauthorizedListeners.add(listener);
  return () => {
    unauthorizedListeners.delete(listener);
  };
}

export function notifyUnauthorized(): void {
  unauthorizedListeners.forEach((listener) => {
    listener();
  });
}
