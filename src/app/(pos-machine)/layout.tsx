import type { ReactNode } from "react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { PosMachineShell } from "@/components/layout/pos-machine-shell";

export default function PosMachineLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <PosMachineShell>{children}</PosMachineShell>
    </AuthGuard>
  );
}
