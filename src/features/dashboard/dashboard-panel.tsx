import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type DashboardPanelProps = {
  title: string;
  href: string;
  linkLabel: string;
  children: ReactNode;
};

export function DashboardPanel({ title, href, linkLabel, children }: DashboardPanelProps) {
  return (
    <section className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-foreground/10">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="truncate text-sm font-medium">{title}</h2>
        <Link
          href={href}
          className="rounded-md px-2 py-1 text-xs font-medium text-brand-secondary no-underline transition-colors hover:bg-brand-secondary-soft"
        >
          {linkLabel}
        </Link>
      </div>
      {children}
    </section>
  );
}

type DashboardTableProps = {
  primaryLabel: string;
  valueLabel: string;
  children: ReactNode;
};

export function DashboardTable({ primaryLabel, valueLabel, children }: DashboardTableProps) {
  return (
    <table className="w-full table-fixed text-sm">
      <thead>
        <tr>
          <th className="pb-2 text-left text-[11px] font-medium tracking-wide text-brand-secondary uppercase">
            {primaryLabel}
          </th>
          <th className="w-28 pb-2 text-right text-[11px] font-medium tracking-wide text-brand-secondary uppercase">
            {valueLabel}
          </th>
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}

type DashboardTableRowProps = {
  title: string;
  subtitle?: string;
  value: ReactNode;
  tone?: "default" | "danger";
};

export function DashboardTableRow({
  title,
  subtitle,
  value,
  tone = "default",
}: DashboardTableRowProps) {
  return (
    <tr className="odd:bg-muted/55">
      <td className="rounded-l-md px-2.5 py-2 align-middle">
        <p className="truncate font-medium">{title}</p>
        {subtitle ? <p className="truncate text-xs text-muted-foreground">{subtitle}</p> : null}
      </td>
      <td
        className={cn(
          "rounded-r-md px-2.5 py-2 text-right align-middle text-sm font-medium tabular-nums",
          tone === "danger" ? "text-destructive" : "text-foreground",
        )}
      >
        {value}
      </td>
    </tr>
  );
}
