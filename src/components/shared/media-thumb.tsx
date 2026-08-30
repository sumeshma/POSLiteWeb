import { ImageOff } from "lucide-react";
import { resolveMediaUrl } from "@/lib/media";
import { cn } from "@/lib/utils";

type MediaThumbProps = {
  src?: string | null;
  alt?: string;
  className?: string;
};

export function MediaThumb({ src, alt = "", className }: MediaThumbProps) {
  const url = resolveMediaUrl(src);

  if (!url) {
    return (
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground ring-1 ring-border",
          className,
        )}
        aria-hidden={alt ? undefined : true}
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
      >
        <ImageOff className="size-4" />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={alt}
      className={cn("size-10 shrink-0 rounded-md object-cover ring-1 ring-border", className)}
    />
  );
}
