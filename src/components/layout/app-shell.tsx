"use client";

import { useMemo, useState, type ReactNode } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppShellContext } from "@/components/layout/app-shell-context";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const contextValue = useMemo(
    () => ({
      collapsed,
      setCollapsed,
      mobileOpen,
      setMobileOpen,
    }),
    [collapsed, mobileOpen],
  );

  return (
    <AppShellContext.Provider value={contextValue}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:shadow-md"
      >
        Skip to content
      </a>
      <div className="flex h-svh min-h-0 w-full overflow-hidden bg-background">
        <AppSidebar />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <AppHeader />
          <main
            id="main-content"
            className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto"
          >
            {children}
          </main>
        </div>
      </div>
    </AppShellContext.Provider>
  );
}
