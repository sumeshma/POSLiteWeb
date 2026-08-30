"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { PageLoading } from "@/components/shared/page-loading";

export function GuestGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isReady, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isReady || !isAuthenticated) {
      return;
    }

    const from = searchParams.get("from");
    const target = from && from.startsWith("/") && !from.startsWith("//") ? from : "/";
    router.replace(target);
  }, [isAuthenticated, isReady, router, searchParams]);

  if (!isReady) {
    return (
      <div className="flex min-h-svh items-center justify-center p-6">
        <PageLoading />
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="flex min-h-svh items-center justify-center p-6">
        <PageLoading />
      </div>
    );
  }

  return children;
}
