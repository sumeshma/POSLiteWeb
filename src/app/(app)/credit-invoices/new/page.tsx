import type { Metadata } from "next";
import { CreateCreditInvoicePage } from "@/features/credit-invoices/create-credit-invoice-page";

export const metadata: Metadata = {
  title: "New credit invoice",
};

export default function NewCreditInvoiceRoute() {
  return <CreateCreditInvoicePage />;
}
