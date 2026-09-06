"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { appConfig } from "@/config/app";
import { appNavigation, filterNavigation, getNavItemForPath } from "@/config/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { BrandLogo } from "@/components/layout/brand-logo";
import { UserMenu } from "@/components/layout/user-menu";
import { useAppShell } from "@/components/layout/app-shell-context";
import { buttonVariants } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

function NavContent({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();
  const { setMobileOpen } = useAppShell();
  const { user } = useAuth();
  const groups = filterNavigation(appNavigation, {
    permissions: user?.permissions ?? [],
    role: user?.role,
  });

  return (
    <nav aria-label="Main" className="flex flex-1 flex-col gap-4 px-2 py-3">
      {groups.map((group) => (
        <div key={group.id} className="space-y-1">
          {group.label && !collapsed ? (
            <p className="px-2 pb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {group.label}
            </p>
          ) : null}
          {group.items.map((item) => {
            const isActive = getNavItemForPath(pathname)?.href === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.title : undefined}
                aria-current={isActive ? "page" : undefined}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "h-9 w-full gap-2 hover:bg-brand-secondary-soft hover:text-brand-secondary",
                  collapsed ? "justify-center px-0" : "justify-start px-2.5",
                  isActive &&
                    "bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <item.icon className="size-4 shrink-0" aria-hidden="true" />
                {!collapsed ? <span className="truncate">{item.title}</span> : null}
                {collapsed ? <span className="sr-only">{item.title}</span> : null}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

export function AppSidebar() {
  const { collapsed } = useAppShell();

  return (
    <aside
      className={cn(
        "hidden h-full min-h-0 shrink-0 flex-col overflow-hidden border-r bg-sidebar text-sidebar-foreground lg:flex",
        "transition-[width] duration-200 ease-out motion-reduce:transition-none",
        collapsed ? "w-16" : "w-56",
      )}
    >
      <div className="flex h-16 shrink-0 items-center justify-center border-b px-2">
        <Link href="/" className="flex max-w-full items-center justify-center" aria-label={appConfig.name}>
          <BrandLogo compact={collapsed} className={collapsed ? "h-7" : "h-8"} priority />
        </Link>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <NavContent collapsed={collapsed} />
      </ScrollArea>
      <Separator />
      <div className={cn("p-2", collapsed && "px-1")}>
        <UserMenu compact={collapsed} />
      </div>
    </aside>
  );
}

export function MobileNav() {
  return (
    <div className="flex h-full flex-col bg-sidebar">
      <div className="flex h-16 shrink-0 items-center justify-center border-b px-3">
        <Link href="/" className="flex max-w-full items-center justify-center" aria-label={appConfig.name}>
          <BrandLogo className="h-8" priority />
        </Link>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <NavContent collapsed={false} />
      </ScrollArea>
    </div>
  );
}
