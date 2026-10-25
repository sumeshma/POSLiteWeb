import type { Metadata } from "next";
import { OutstandingReportPage } from "@/features/credit-invoices/outstanding-report-page";

export const metadata: Metadata = {
  title: "Outstanding credit",
};

export default function OutstandingCreditRoute() {
  return <OutstandingReportPage />;
}
