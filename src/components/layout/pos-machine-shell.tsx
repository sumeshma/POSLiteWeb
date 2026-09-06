"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { LayoutDashboard, LogOut, Menu, Monitor, ShoppingCart } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { BrandLogo } from "@/components/layout/brand-logo";
import { FullscreenToggle } from "@/components/layout/fullscreen-toggle";
import { HeaderUserMenu } from "@/components/layout/user-menu";
import { formatShopSessionLabel } from "@/lib/session";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function PosMachineShell({ children }: { children: ReactNode }) {
  const { session, logout } = useAuth();
  const shopLabel = formatShopSessionLabel(session?.shopCode, session?.shopDisplayName);

  return (
    <div className="flex h-svh min-h-0 flex-col bg-background">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-3 md:px-4">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" size="icon" aria-label="POS menu" />}
          >
            <Menu />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel>POS Machine Mode</DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/" />}>
              <LayoutDashboard className="size-4" />
              Return to main application
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/pos" />}>
              <ShoppingCart className="size-4" />
              Standard POS
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => void logout()}>
              <LogOut className="size-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <BrandLogo className="h-9" />
          <p className="hidden min-w-0 truncate text-xs text-muted-foreground sm:block">
            <Monitor className="mr-1 inline size-3 align-text-top" aria-hidden="true" />
            {shopLabel ? `${shopLabel} · Machine Mode` : "Machine Mode"}
          </p>
        </div>
        <FullscreenToggle />
        <HeaderUserMenu />
      </header>
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</main>
    </div>
  );
}
