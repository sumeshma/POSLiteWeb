import type { Metadata } from "next";
import { CreditInvoicesHomePage } from "@/features/credit-invoices/credit-invoices-home-page";

export const metadata: Metadata = {
  title: "Credit invoices",
};

export default function CreditInvoicesRoute() {
  return <CreditInvoicesHomePage />;
}
