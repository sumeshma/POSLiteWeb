"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/auth/auth-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { queryKeys } from "@/config/query-keys";
import { resolveMediaUrl } from "@/lib/media";
import { getShopBranding } from "@/services/auth.service";

function shopInitials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "S";
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function HeaderShop() {
  const { session } = useAuth();
  const shopCode = session?.shopCode ?? "";
  const shopName = session?.shopDisplayName?.trim() || shopCode;
  const brandingQuery = useQuery({
    queryKey: queryKeys.shop.branding(shopCode),
    queryFn: () => getShopBranding(shopCode),
    enabled: Boolean(shopCode),
    staleTime: 5 * 60 * 1000,
  });
  const logoUrl = resolveMediaUrl(brandingQuery.data?.logoImageUrl);

  if (!shopName) {
    return null;
  }

  return (
    <Link
      href="/shop"
      className="flex min-w-0 max-w-[16rem] cursor-pointer items-center gap-2 rounded-lg bg-white px-2 py-1 ring-1 ring-foreground/10 transition-colors hover:bg-zinc-50 hover:ring-foreground/20"
      title={`${shopName} — shop details`}
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-gradient p-px">
        <Avatar className="size-7 after:hidden">
          {logoUrl ? <AvatarImage src={logoUrl} alt="" /> : null}
          <AvatarFallback className="bg-primary-soft text-[11px] font-semibold text-primary">
            {shopInitials(shopName)}
          </AvatarFallback>
        </Avatar>
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold tracking-tight">{shopName}</span>
        {shopCode ? (
          <span className="block truncate text-[10px] font-medium tracking-wide text-brand-secondary uppercase">
            {shopCode}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
