import type { Metadata } from "next";
import { CollectionsReportPage } from "@/features/credit-invoices/collections-report-page";

export const metadata: Metadata = {
  title: "Credit collections",
};

export default function CreditCollectionsRoute() {
  return <CollectionsReportPage />;
}
