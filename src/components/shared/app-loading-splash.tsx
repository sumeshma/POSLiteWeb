import { BrandLogo } from "@/components/layout/brand-logo";
import { cn } from "@/lib/utils";

type AppLoadingSplashProps = {
  title?: string;
  description?: string;
  hint?: string;
  className?: string;
};

export function AppLoadingSplash({
  title = "POS Lite is loading",
  description = "Opening your shop from Auralizz…",
  hint = "This only takes a moment",
  className,
}: AppLoadingSplashProps) {
  return (
    <div
      className={cn(
        "flex min-h-svh items-center justify-center bg-background p-4",
        className,
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="w-full max-w-md rounded-2xl bg-white px-8 py-10 text-center shadow-sm ring-1 ring-foreground/10">
        <BrandLogo className="mx-auto h-12" priority />
        <h1 className="mt-6 text-lg font-semibold tracking-tight text-foreground">{title}</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
        <div className="mx-auto mt-6 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-brand-secondary-soft">
          <div className="app-loading-bar h-full w-1/3 rounded-full bg-brand-secondary" />
        </div>
        <p className="mt-4 text-xs text-muted-foreground">{hint}</p>
      </div>
    </div>
  );
}
