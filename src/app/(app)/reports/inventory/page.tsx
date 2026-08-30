import type { Metadata } from "next";
import { InventoryReportPage } from "@/features/reports/inventory-report-page";

export const metadata: Metadata = {
  title: "Inventory report",
};

export default function InventoryReportRoute() {
  return <InventoryReportPage />;
}
