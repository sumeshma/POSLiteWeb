import type { Metadata } from "next";
import { ProfitLossReportPage } from "@/features/reports/profit-loss-report-page";

export const metadata: Metadata = {
  title: "Profit & loss",
};

export default function ProfitLossReportRoute() {
  return <ProfitLossReportPage />;
}
