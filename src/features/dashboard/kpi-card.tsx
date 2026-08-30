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
      className={cn(
        "flex h-full items-center gap-3.5 rounded-xl border border-border bg-white p-4 shadow-sm",
        className,
      )}
    >
      {Icon ? (
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-lg",
            styles.icon,
          )}
        >
          <Icon className="size-5" aria-hidden />
        </div>
      ) : null}
      <div className="min-w-0 flex-1">
        <p className={cn("text-[11px] font-medium tracking-wide uppercase", styles.label)}>
          {label}
        </p>
        <p className="mt-0.5 text-[1.625rem] leading-8 font-semibold tabular-nums text-foreground">
          {value}
        </p>
        {hint ? <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p> : null}
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
