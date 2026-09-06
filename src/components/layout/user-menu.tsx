"use client";

import { useState } from "react";
import { ChevronDown, KeyRound, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChangePasswordDialog } from "@/features/account/change-password-dialog";
import { ProfileDialog } from "@/features/account/profile-dialog";
import { resolveMediaUrl } from "@/lib/media";
import { formatShopSessionLabel } from "@/lib/session";
import { getUserDisplayName, getUserInitials } from "@/types/auth";
import { cn } from "@/lib/utils";

type UserMenuProps = {
  compact?: boolean;
};

export function UserMenu({ compact = false }: UserMenuProps) {
  const { user, session, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const displayName = getUserDisplayName(user);
  const initials = getUserInitials(user);
  const imageUrl = resolveMediaUrl(user?.profileImageUrl);
  const shopLabel = formatShopSessionLabel(session?.shopCode, session?.shopDisplayName);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            "flex w-full cursor-pointer items-center gap-2 rounded-md p-1.5 text-left hover:bg-brand-secondary-soft hover:text-brand-secondary",
            compact && "justify-center p-1",
          )}
        >
          <Avatar size="sm">
            {imageUrl ? <AvatarImage src={imageUrl} alt="" /> : null}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          {!compact ? (
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{displayName}</span>
              <span className="block truncate text-xs text-muted-foreground">
                {user?.role}
                {shopLabel ? ` · ${shopLabel}` : ""}
              </span>
            </span>
          ) : (
            <span className="sr-only">{displayName}</span>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-52">
          <DropdownMenuGroup>
            <DropdownMenuLabel>
              <span className="block truncate">{displayName}</span>
              <span className="block truncate font-normal text-muted-foreground">
                {user?.username}
              </span>
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setProfileOpen(true)}>
            <Settings className="size-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setPasswordOpen(true)}>
            <KeyRound className="size-4" />
            Change password
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => void logout()}>
            <LogOut className="size-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
      <ChangePasswordDialog open={passwordOpen} onOpenChange={setPasswordOpen} />
    </>
  );
}

export function HeaderUserMenu() {
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const displayName = getUserDisplayName(user);
  const initials = getUserInitials(user);
  const imageUrl = resolveMediaUrl(user?.profileImageUrl);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className="flex cursor-pointer items-center gap-2 rounded-lg px-1.5 py-1 text-left hover:bg-brand-secondary-soft hover:text-brand-secondary"
          aria-label="Account menu"
        >
          <span className="hidden min-w-0 text-right sm:inline">
            <span className="block truncate text-sm font-medium">{displayName}</span>
            <span className="block truncate text-xs text-muted-foreground">
              {user?.role}
            </span>
          </span>
          <Avatar size="sm">
            {imageUrl ? <AvatarImage src={imageUrl} alt="" /> : null}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <ChevronDown className="hidden size-4 shrink-0 text-muted-foreground sm:inline" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-52">
          <DropdownMenuGroup>
            <DropdownMenuLabel>
              <span className="block truncate">{displayName}</span>
              <span className="block truncate font-normal text-muted-foreground">
                {user?.role}
                {user?.username ? ` · ${user.username}` : ""}
              </span>
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setProfileOpen(true)}>
            <Settings className="size-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setPasswordOpen(true)}>
            <KeyRound className="size-4" />
            Change password
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => void logout()}>
            <LogOut className="size-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
      <ChangePasswordDialog open={passwordOpen} onOpenChange={setPasswordOpen} />
    </>
  );
}
