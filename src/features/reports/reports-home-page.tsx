"use client";

import Link from "next/link";
import {
  ClipboardList,
  FileBarChart,
  Receipt,
  Scale,
  Wallet,
  Warehouse,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { permissions } from "@/config/permissions";
import { useAuth } from "@/components/auth/auth-provider";

type ReportCard = {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  available: boolean;
};

export function ReportsHomePage() {
  const { can } = useAuth();
  const cards: ReportCard[] = [
    {
      href: "/reports/sales",
      title: "Sales report",
      description: "Period sales totals, payment mix, and paged bills from the orders API.",
      icon: Receipt,
      available: can(permissions.reports),
    },
    {
      href: "/reports/profit-loss",
      title: "Profit & loss",
      description: "Backend revenue, purchases, expenses, and profit for the selected period.",
      icon: Scale,
      available: can(permissions.reportsProfit),
    },
    {
      href: "/reports/gst",
      title: "GST report",
      description: "Taxable amount and GST totals for a date range supplied by the backend.",
      icon: FileBarChart,
      available: can(permissions.reportsTax),
    },
    {
      href: "/reports/inventory",
      title: "Inventory report",
      description: "Current stock counts, low-stock alerts, and recent movements.",
      icon: Warehouse,
      available: can(permissions.inventory),
    },
    {
      href: "/reports/purchases",
      title: "Purchase report",
      description: "Purchase history with search, supplier, and date filters.",
      icon: ClipboardList,
      available: can(permissions.purchases),
    },
    {
      href: "/reports/expenses",
      title: "Expense report",
      description: "Expenses by date and category, with backend P&L totals when permitted.",
      icon: Wallet,
      available: can(permissions.expenses),
    },
  ];
  const visible = cards.filter((card) => card.available);

  return (
    <PageContainer>
      <PageHeader
        title="Reports"
        description="Operational reports from verified backend summaries and existing shop records. Product performance reports are not provided by the API."
      />

      {visible.length === 0 ? (
        <EmptyState
          title="No reports available"
          description="Your account does not have permission to view sales, inventory, purchase, or expense reports."
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
  );
}
