"use client";

import { Menu, PanelLeft } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAppShell } from "@/components/layout/app-shell-context";
import { MobileNav } from "@/components/layout/app-sidebar";
import { FullscreenToggle } from "@/components/layout/fullscreen-toggle";
import { HeaderShop } from "@/components/layout/header-shop";
import { HeaderUserMenu } from "@/components/layout/user-menu";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

function isStandardPosPath(pathname: string): boolean {
  return pathname.replace(/\/$/, "") === "/pos";
}

export function AppHeader() {
  const pathname = usePathname();
  const { collapsed, setCollapsed, mobileOpen, setMobileOpen } = useAppShell();
  const showFullscreen = isStandardPosPath(pathname);

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b bg-white px-3 md:px-4">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
      >
        <Menu className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="hidden lg:inline-flex"
        onClick={() => setCollapsed(!collapsed)}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-pressed={collapsed}
      >
        <PanelLeft className="size-4" />
      </Button>
      <HeaderShop />
      <div className="min-w-0 flex-1" />
      {showFullscreen ? <FullscreenToggle /> : null}
      <HeaderUserMenu />
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-60 p-0" showCloseButton>
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <MobileNav />
        </SheetContent>
      </Sheet>
    </header>
  );
}
