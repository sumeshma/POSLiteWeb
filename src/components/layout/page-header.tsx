"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { getNavItemForPath } from "@/config/navigation";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  icon?: LucideIcon;
};

export function PageHeader({
  title,
  description,
  actions,
  className,
  icon,
}: PageHeaderProps) {
  const pathname = usePathname();
  const Icon = icon ?? getNavItemForPath(pathname)?.icon;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        {Icon ? (
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
            <Icon className="size-5" aria-hidden />
          </div>
        ) : null}
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">{title}</h1>
          {description ? (
            <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}
