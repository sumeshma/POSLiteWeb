import type { Metadata } from "next";
import { ProductSalesReportPage } from "@/features/reports/product-sales-report-page";

export const metadata: Metadata = {
  title: "Product sales",
};

export default function ProductSalesReportRoute() {
  return <ProductSalesReportPage />;
}
