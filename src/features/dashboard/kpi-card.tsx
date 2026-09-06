import type { LucideIcon } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

export type KpiTone = "primary" | "secondary" | "success" | "warning" | "destructive";

type KpiCardProps = {
  label: string;
  value: string;
  hint?: string;
  className?: string;
  icon?: LucideIcon;
  tone?: KpiTone;
};

const toneStyles: Record<KpiTone, { label: string; icon: string }> = {
  primary: {
    label: "text-primary",
    icon: "bg-primary-soft text-primary",
  },
  secondary: {
    label: "text-brand-secondary",
    icon: "bg-brand-secondary-soft text-brand-secondary",
  },
  success: {
    label: "text-success",
    icon: "bg-success/10 text-success",
  },
  warning: {
    label: "text-warning-foreground",
    icon: "bg-warning/15 text-warning-foreground",
  },
  destructive: {
    label: "text-destructive",
    icon: "bg-destructive/10 text-destructive",
  },
};

export function KpiCard({
  label,
  value,
  hint,
  className,
  icon: Icon,
  tone = "primary",
}: KpiCardProps) {
  const styles = toneStyles[tone];

  return (
    <div
      data-tone={tone}
      className={cn(
        "kpi-card flex h-full min-w-0 items-center gap-2 rounded-xl border border-border bg-white p-2.5 shadow-sm sm:gap-3.5 sm:p-4",
        className,
      )}
    >
      {Icon ? (
        <div
          className={cn(
            "hidden size-9 shrink-0 items-center justify-center rounded-lg sm:flex sm:size-11",
            styles.icon,
          )}
        >
          <Icon className="size-4 sm:size-5" aria-hidden />
        </div>
      ) : null}
      <div className="min-w-0 flex-1">
        <p className={cn("truncate text-[10px] font-medium tracking-wide uppercase sm:text-[11px]", styles.label)}>
          {label}
        </p>
        <p className="mt-0.5 truncate text-base leading-5 font-semibold tabular-nums text-foreground sm:text-[1.625rem] sm:leading-8">
          {value}
        </p>
        {hint ? (
          <p className="mt-0.5 hidden truncate text-xs text-muted-foreground sm:block">{hint}</p>
        ) : null}
      </div>
    </div>
  );
}

export function formatKpiCurrency(value: number): string {
  return formatCurrency(value);
}

export function formatKpiNumber(value: number): string {
  return new Intl.NumberFormat("en-IN").format(value);
}
