import { Suspense } from "react";
import type { Metadata } from "next";
import { CreditInvoiceDetailPage } from "@/features/credit-invoices/credit-invoice-detail-page";
import { PageLoading } from "@/components/shared/page-loading";

export const metadata: Metadata = {
  title: "Credit invoice",
};

export default function CreditInvoiceDetailRoute() {
  return (
    <Suspense fallback={<PageLoading />}>
      <CreditInvoiceDetailPage />
    </Suspense>
  );
}
