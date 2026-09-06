import type { ReactNode } from "react";
import { PageCard } from "@/components/layout/page-card";
import { cn } from "@/lib/utils";

type PageContainerProps = {
  children: ReactNode;
  className?: string;
  /** Wrap page content in the white outer card. Defaults to true. */
  card?: boolean;
  /** Fill the remaining shell height (POS workspace). Defaults to false. */
  fill?: boolean;
};

export function PageContainer({
  children,
  className,
  card = true,
  fill = false,
}: PageContainerProps) {
  const content = card ? (
    <PageCard className={cn(fill && "flex h-full min-h-0 flex-1 overflow-hidden", className)}>
      {children}
    </PageCard>
  ) : (
    <div className={cn("flex flex-col gap-6", fill && "h-full min-h-0 flex-1", className)}>
      {children}
    </div>
  );

  return (
    <div
      className={cn(
        "mx-auto w-full",
        fill
          ? "flex h-full min-h-0 flex-1 flex-col p-2 md:p-6"
          : "flex flex-col p-4 md:p-6",
      )}
    >
      {content}
    </div>
  );
}
