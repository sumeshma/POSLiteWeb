import type { Metadata } from "next";
import { StockHistoryPage } from "@/features/inventory/stock-history-page";

export const metadata: Metadata = {
  title: "Stock history",
};

export default function StockHistoryRoute() {
  return <StockHistoryPage />;
}
