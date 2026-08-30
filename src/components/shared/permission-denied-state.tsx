import { ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PermissionDeniedStateProps = {
  title?: string;
  description?: string;
  onBack?: () => void;
  backLabel?: string;
  className?: string;
};

export function PermissionDeniedState({
  title = "Permission denied",
          description = "You are signed in, but you do not have permission to view this page.",
  onBack,
  backLabel = "Go back",
  className,
}: PermissionDeniedStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-12 text-center",
        className,
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <ShieldOff className="size-6" aria-hidden="true" />
      </div>
      <div className="space-y-1">
        <h2 className="text-base font-medium">{title}</h2>
        <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      </div>
      {onBack ? (
        <Button type="button" variant="outline" onClick={onBack}>
          {backLabel}
        </Button>
      ) : null}
    </div>
  );
}
