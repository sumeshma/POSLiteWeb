import type { Metadata } from "next";
import { SuppliersPage } from "@/features/suppliers/suppliers-page";

export const metadata: Metadata = {
  title: "Suppliers",
};

export default function SuppliersRoute() {
  return <SuppliersPage />;
}
