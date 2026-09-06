"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type QuickAccessItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

type QuickAccessBarProps = {
  items: QuickAccessItem[];
  className?: string;
};

export function QuickAccessBar({ items, className }: QuickAccessBarProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className={cn("space-y-2", className)}>
      <h2 className="text-sm font-medium text-foreground">Quick access</h2>
      <nav
        aria-label="Quick access"
        className="overflow-hidden rounded-xl border border-border bg-white shadow-sm"
      >
        <ul className="grid grid-cols-2 gap-px bg-border sm:grid-cols-3 md:flex md:gap-0 md:divide-x md:divide-border md:bg-transparent">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.href} className="min-w-0 bg-white md:flex-1">
                <Link
                  href={item.href}
                  className="group flex h-full flex-col items-center justify-center gap-2 px-2 py-4 text-center no-underline transition-colors hover:bg-brand-secondary-soft/70 focus-visible:bg-brand-secondary-soft focus-visible:outline-none"
                >
                  <span className="flex size-10 items-center justify-center rounded-full bg-brand-secondary-soft text-brand-secondary transition-colors group-hover:bg-brand-secondary group-hover:text-brand-secondary-foreground">
                    <Icon className="size-5" strokeWidth={1.75} aria-hidden />
                  </span>
                  <span className="text-xs font-medium leading-tight text-brand-secondary">
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </section>
  );
}
