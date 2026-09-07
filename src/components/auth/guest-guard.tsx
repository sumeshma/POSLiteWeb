"use client";

import { useEffect, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { AppLoadingSplash } from "@/components/shared/app-loading-splash";
import { getPostLoginPath, hardNavigate } from "@/lib/auth-paths";

export function GuestGuard({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const { isReady, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isReady || !isAuthenticated) {
      return;
    }

    hardNavigate(getPostLoginPath(searchParams.get("from")));
  }, [isAuthenticated, isReady, searchParams]);

  if (!isReady || isAuthenticated) {
    return <AppLoadingSplash description="Getting your shop ready…" />;
  }

  return children;
}
