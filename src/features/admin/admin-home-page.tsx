"use client";

import Link from "next/link";
import { Clock, ScrollText, ShieldCheck, UserCog } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { RequirePermission } from "@/components/auth/require-permission";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { permissions } from "@/config/permissions";

const ADMIN_PERMISSIONS = [
  permissions.usersManage,
  permissions.rolesManage,
  permissions.activityLogs,
];

type AdminCard = {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  available: boolean;
};

export function AdminHomePage() {
  const { can } = useAuth();
  const cards: AdminCard[] = [
    {
      href: "/admin/users",
      title: "Users",
      description: "Create and edit shop users, reset passwords, and restore deleted accounts.",
      icon: UserCog,
      available: can(permissions.usersManage),
    },
    {
      href: "/admin/roles",
      title: "Roles",
      description: "Manage app roles and assign keys from the backend permission catalog.",
      icon: ShieldCheck,
      available: can(permissions.rolesManage),
    },
    {
      href: "/admin/activity",
      title: "Activity logs",
      description: "Search backend audit events by user, module, action, and date.",
      icon: ScrollText,
      available: can(permissions.activityLogs),
    },
    {
      href: "/admin/attendance",
      title: "Attendance",
      description: "Review login and logout records. Check-in is created by authentication.",
      icon: Clock,
      available: can(permissions.usersManage),
    },
  ];
  const visible = cards.filter((card) => card.available);

  return (
    <RequirePermission anyPermission={ADMIN_PERMISSIONS}>
      <PageContainer>
        <PageHeader
          title="Administration"
          description="User, role, activity, and attendance tools that are supported by the live API. Shop settings editing remains deferred."
        />

        {visible.length === 0 ? (
          <EmptyState
            title="No administration modules available"
            description="Your account does not have permission to manage users, roles, activity logs, or attendance."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.href}
                  href={card.href}
                  className="rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <Card className="h-full bg-white transition-colors hover:bg-brand-secondary-soft/60">
                    <CardHeader>
                      <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
                        <Icon className="size-5" aria-hidden="true" />
                      </div>
                      <CardTitle>{card.title}</CardTitle>
                      <CardDescription>{card.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </PageContainer>
    </RequirePermission>
  );
}
