import type { Metadata } from "next";
import { PurchasesReportPage } from "@/features/reports/purchases-report-page";

export const metadata: Metadata = {
  title: "Purchase report",
};

export default function PurchasesReportRoute() {
  return <PurchasesReportPage />;
}
