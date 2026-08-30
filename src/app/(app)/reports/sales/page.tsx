import type { Metadata } from "next";
import { SalesReportPage } from "@/features/reports/sales-report-page";

export const metadata: Metadata = {
  title: "Sales report",
};

export default function SalesReportRoute() {
  return <SalesReportPage />;
}
