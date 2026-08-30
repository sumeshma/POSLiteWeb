import type { Metadata } from "next";
import { ExpensesReportPage } from "@/features/reports/expenses-report-page";

export const metadata: Metadata = {
  title: "Expense report",
};

export default function ExpensesReportRoute() {
  return <ExpensesReportPage />;
}
