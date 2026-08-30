import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageCardProps = {
  children: ReactNode;
  className?: string;
};

export function PageCard({ children, className }: PageCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6 rounded-xl bg-card p-4 text-card-foreground shadow-sm ring-1 ring-foreground/10 md:p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}
