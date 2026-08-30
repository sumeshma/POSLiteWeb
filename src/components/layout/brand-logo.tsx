import Image from "next/image";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  compact?: boolean;
  className?: string;
  priority?: boolean;
};

export function BrandLogo({ compact = false, className, priority = false }: BrandLogoProps) {
  if (compact) {
    return (
      <Image
        src="/brand/logo-mark.png"
        alt="Auralizz POS Lite"
        width={40}
        height={34}
        className={cn("h-9 w-auto", className)}
        priority={priority}
      />
    );
  }

  return (
    <Image
      src="/brand/logo-full.png"
      alt="Auralizz POS Lite"
      width={200}
      height={51}
      className={cn("h-10 w-auto max-w-full", className)}
      priority={priority}
    />
  );
}
