"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { BrandLogo } from "@/components/layout/brand-logo";
import { AppLoadingSplash } from "@/components/shared/app-loading-splash";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const SSO_FAILURE_COPY = "Open the company again from Auralizz";

const ssoAttempts = new Map<string, Promise<"ok" | "error">>();

function subscribeSearch(onStoreChange: () => void): () => void {
  window.addEventListener("popstate", onStoreChange);
  return () => window.removeEventListener("popstate", onStoreChange);
}

function getSearch(): string {
  return window.location.search;
}

function readCallbackCode(search: string): string {
  return new URLSearchParams(search).get("code")?.trim() ?? "";
}

function redeemOnce(code: string, redeem: (code: string) => Promise<void>): Promise<"ok" | "error"> {
  const existing = ssoAttempts.get(code);
  if (existing) {
    return existing;
  }

  const attempt = redeem(code)
    .then(() => "ok" as const)
    .catch(() => "error" as const);
  ssoAttempts.set(code, attempt);
  return attempt;
}

export function SsoCallbackPage() {
  const { completeSso } = useAuth();
  const isClient = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const search = useSyncExternalStore(subscribeSearch, getSearch, () => "");
  const code = isClient ? readCallbackCode(search) : "";
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!code) {
      return;
    }

    let active = true;
    void redeemOnce(code, completeSso).then((result) => {
      if (!active) {
        return;
      }
      if (result === "ok") {
        // Full load so AuthGuard and API headers boot from the new shop session.
        // Client replace("/") left the previous shop in memory until a refresh.
        window.location.replace("/");
        return;
      }
      setFailed(true);
    });

    return () => {
      active = false;
    };
  }, [code, completeSso]);

  const showError = isClient && (!code || failed);

  if (!showError) {
    return <AppLoadingSplash />;
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-5">
        <div className="flex justify-center">
          <BrandLogo className="h-12" priority />
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-foreground/10 md:p-8">
          <Alert variant="destructive">
            <AlertTitle>Unable to sign in</AlertTitle>
            <AlertDescription>{SSO_FAILURE_COPY}</AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}
