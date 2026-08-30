import { Suspense, type ReactNode } from "react";
import { PageLoading } from "@/components/shared/page-loading";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-svh items-center justify-center p-6">
          <PageLoading />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
