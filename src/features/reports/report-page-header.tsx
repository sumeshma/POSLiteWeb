"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import type { ReactNode } from "react";

type ReportPageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function ReportPageHeader({ title, description, actions }: ReportPageHeaderProps) {
  return (
    <div className="space-y-3">
      <Link
        href="/reports"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
        All reports
      </Link>
      <PageHeader title={title} description={description} actions={actions} />
    </div>
  );
}
