import type { ReactNode } from "react";
import { LoadingState } from "@/components/shared/loading-state";
import { cn } from "@/lib/utils";

type LocalLoadingProps = {
  loading: boolean;
  label?: string;
  children: ReactNode;
  className?: string;
};

export function LocalLoading({
  loading,
  label = "Loading...",
  children,
  className,
}: LocalLoadingProps) {
  return (
    <div className={cn("relative", className)}>
      {children}
      {loading ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-[inherit] bg-background/70">
          <LoadingState label={label} className="py-6" />
        </div>
      ) : null}
    </div>
  );
}
