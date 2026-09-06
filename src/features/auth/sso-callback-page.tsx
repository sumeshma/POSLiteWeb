"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { BrandLogo } from "@/components/layout/brand-logo";
import { LoadingState } from "@/components/shared/loading-state";
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

  return (
    <div className="relative flex min-h-svh flex-col bg-background">
      <div className="pointer-events-none absolute inset-0 bg-brand-gradient opacity-[0.07]" />
      <div className="relative flex flex-1 items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md">
          <div className="mb-5 flex justify-center">
            <div className="inline-flex items-center rounded-xl bg-white px-3 py-2 shadow-sm ring-1 ring-foreground/10">
              <BrandLogo className="h-9" priority />
            </div>
          </div>

          <div className="overflow-hidden rounded-xl bg-card text-card-foreground shadow-sm ring-1 ring-foreground/10">
            <div className="h-1.5 bg-brand-gradient" />
            <div className="p-6 md:p-8">
              {showError ? (
                <Alert variant="destructive">
                  <AlertTitle>Unable to sign in</AlertTitle>
                  <AlertDescription>{SSO_FAILURE_COPY}</AlertDescription>
                </Alert>
              ) : (
                <LoadingState label="Signing you in to POS Lite…" className="py-8" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
