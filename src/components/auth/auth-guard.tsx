"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { AppLoadingSplash } from "@/components/shared/app-loading-splash";
import { getBrowserPathname, hardNavigate, isPublicAuthPath } from "@/lib/auth-paths";

export function AuthGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { isReady, isAuthenticated } = useAuth();
  const requestPath = getBrowserPathname(pathname);
  const isPublic = isPublicAuthPath(requestPath) || isPublicAuthPath(pathname);

  useEffect(() => {
    if (!isReady || isAuthenticated || isPublic) {
      return;
    }

    const params = new URLSearchParams();
    if (pathname && pathname !== "/") {
      params.set("from", pathname);
    }
    const query = params.toString();
    hardNavigate(query ? `/login?${query}` : "/login");
  }, [isAuthenticated, isPublic, isReady, pathname]);

  if (isPublic) {
    return null;
  }

  if (!isReady || !isAuthenticated) {
    return (
      <AppLoadingSplash
        description="Getting your shop ready…"
      />
    );
  }

  return children;
}
