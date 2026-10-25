"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/form-field";
import { KpiCard, formatKpiCurrency, formatKpiNumber } from "@/features/dashboard/kpi-card";
import { cn } from "@/lib/utils";
import { creditInvoicePath } from "./credit-invoice-paths";
import { CreditInvoiceScreen } from "./credit-invoice-screen";
import { useCreditInvoiceAccess } from "./use-credit-invoice-access";
import { useCreditInvoiceSummaryQuery } from "./use-credit-invoices";

export function CreditInvoicesHomePage() {
  const router = useRouter();
  const access = useCreditInvoiceAccess();
  const summaryQuery = useCreditInvoiceSummaryQuery({ enabled: access.canRead });
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const summary = summaryQuery.data;

  function openInvoice() {
    const number = invoiceNumber.trim();
    if (!number) {
      return;
    }
    router.push(creditInvoicePath(number));
  }

  return (
    <CreditInvoiceScreen mode="read">
      <PageHeader
        title="Credit invoices"
        description="Walk-in credit sales use CR invoices and CRP receipts. They are separate from counter bills."
        actions={
          access.canMutate ? (
            <Link href="/credit-invoices/new" className={cn(buttonVariants())}>
              New invoice
            </Link>
          ) : null
        }
      />

      {access.canRead && !access.enabled ? (
        <Alert>
          <AlertDescription>
            Credit invoices are turned off for this shop. Admins can still open history and reports.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Outstanding"
          value={formatKpiCurrency(summary?.outstandingBalance ?? 0)}
          hint={summary?.timeZoneLabel ?? undefined}
          tone="warning"
        />
        <KpiCard
          label="Open invoices"
          value={formatKpiNumber(summary?.outstandingInvoices ?? 0)}
        />
        <KpiCard
          label="Collected today"
          value={formatKpiCurrency(summary?.collectionsToday ?? 0)}
          tone="secondary"
        />
        <KpiCard
          label="Reversed today"
          value={formatKpiCurrency(summary?.reversedToday ?? 0)}
          tone="destructive"
        />
      </div>

      <form
        className="flex flex-col gap-3 sm:flex-row sm:items-end"
        onSubmit={(event) => {
          event.preventDefault();
          openInvoice();
        }}
      >
        <FormField label="Invoice number" htmlFor="credit-lookup" className="min-w-0 flex-1">
          <Input
            id="credit-lookup"
            value={invoiceNumber}
            onChange={(event) => setInvoiceNumber(event.target.value)}
            placeholder="CR-yyyyMMdd-0001"
          />
        </FormField>
        <Button type="submit">Open</Button>
      </form>

      <div className="flex flex-wrap gap-2">
        <Link href="/credit-invoices/outstanding" className={cn(buttonVariants({ variant: "outline" }))}>
          Outstanding
        </Link>
        <Link href="/credit-invoices/collections" className={cn(buttonVariants({ variant: "outline" }))}>
          Collections
        </Link>
      </div>
    </CreditInvoiceScreen>
  );
}
