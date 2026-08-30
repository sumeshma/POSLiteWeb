import type { Metadata } from "next";
import { PurchasesPage } from "@/features/purchases/purchases-page";

export const metadata: Metadata = {
  title: "Purchases",
};

export default function PurchasesRoute() {
  return <PurchasesPage />;
}
