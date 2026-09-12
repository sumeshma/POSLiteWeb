import { env } from "@/config/env";
import { hardNavigate } from "@/lib/auth-paths";
import { clearSession } from "@/lib/session";
import type { PersistedSession } from "@/types/auth";

let externalExit = false;

export function beginExternalExit(): void {
  externalExit = true;
}

export function isExternalExit(): boolean {
  return externalExit;
}

function auralizzOrigin(): string | null {
  if (!env.auralizzHomeUrl) {
    return null;
  }

  try {
    return new URL(env.auralizzHomeUrl).origin;
  } catch {
    return null;
  }
}

function sanitizeAuralizzUrl(value: string | null | undefined): string | null {
  const origin = auralizzOrigin();
  if (!value || !origin) {
    return env.auralizzHomeUrl;
  }

  try {
    const url = new URL(value);
    if (url.origin !== origin) {
      return env.auralizzHomeUrl;
    }
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return env.auralizzHomeUrl;
    }
    return url.toString();
  } catch {
    return env.auralizzHomeUrl;
  }
}

/** Auralizz page that opened POS Lite, or the configured Auralizz home. */
export function captureAuralizzReturnUrl(): string | null {
  if (typeof document === "undefined") {
    return env.auralizzHomeUrl;
  }
  return sanitizeAuralizzUrl(document.referrer);
}

export function resolvePostLogoutUrl(session: PersistedSession | null): string | null {
  if (session?.openedFrom === "password") {
    return null;
  }

  if (session?.openedFrom === "sso") {
    return sanitizeAuralizzUrl(session.returnTo) ?? env.auralizzHomeUrl;
  }

  return env.auralizzHomeUrl;
}

export function leaveAfterSessionEnd(
  session: PersistedSession | null,
  reason: "logout" | "session" = "session",
): void {
  beginExternalExit();
  const destination = resolvePostLogoutUrl(session);
  clearSession();
  if (destination) {
    window.location.replace(destination);
    return;
  }
  hardNavigate(reason === "session" ? "/login?reason=session" : "/login");
}
