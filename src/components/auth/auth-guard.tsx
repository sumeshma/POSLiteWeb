"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { PageLoading } from "@/components/shared/page-loading";

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isReady, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isReady || isAuthenticated) {
      return;
    }

    const params = new URLSearchParams();
    if (pathname && pathname !== "/") {
      params.set("from", pathname);
    }
    const query = params.toString();
    router.replace(query ? `/login?${query}` : "/login");
  }, [isAuthenticated, isReady, pathname, router]);

  if (!isReady || !isAuthenticated) {
    return (
      <div className="flex min-h-svh items-center justify-center p-6">
        <PageLoading />
      </div>
    );
  }

  return children;
}
