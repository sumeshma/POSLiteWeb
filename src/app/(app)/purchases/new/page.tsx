import type { Metadata } from "next";
import { PurchaseFormPage } from "@/features/purchases/purchase-form-page";

export const metadata: Metadata = {
  title: "Record purchase",
};

export default function NewPurchaseRoute() {
  return <PurchaseFormPage />;
}
