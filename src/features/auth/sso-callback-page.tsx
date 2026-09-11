"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { BrandLogo } from "@/components/layout/brand-logo";
import { AppLoadingSplash } from "@/components/shared/app-loading-splash";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const SSO_FAILURE_COPY = "Open the company again from Auralizz";
const SSO_DONE_PREFIX = "poslite.sso.done:";

const ssoAttempts = new Map<string, Promise<"ok" | "error">>();

function readCallbackCode(): string {
  return new URLSearchParams(window.location.search).get("code")?.trim() ?? "";
}

function doneKey(code: string): string {
  return `${SSO_DONE_PREFIX}${code}`;
}

function waitForVisibleDocument(): Promise<void> {
  if (!document.prerendering) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    document.addEventListener("prerenderingchange", () => resolve(), { once: true });
  });
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
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;

    void (async () => {
      await waitForVisibleDocument();
      if (!active) {
        return;
      }

      const code = readCallbackCode();
      if (!code) {
        setFailed(true);
        return;
      }

      if (sessionStorage.getItem(doneKey(code)) === "ok") {
        window.location.replace("/");
        return;
      }

      const result = await redeemOnce(code, completeSso);
      if (!active) {
        return;
      }
      if (result === "ok") {
        sessionStorage.setItem(doneKey(code), "ok");
        window.location.replace("/");
        return;
      }
      setFailed(true);
    })();

    return () => {
      active = false;
    };
  }, [completeSso]);

  if (!failed) {
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
