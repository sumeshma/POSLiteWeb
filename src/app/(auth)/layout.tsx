import { Suspense, type ReactNode } from "react";
import { AppLoadingSplash } from "@/components/shared/app-loading-splash";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<AppLoadingSplash description="Getting your shop ready…" />}>
      {children}
    </Suspense>
  );
}
