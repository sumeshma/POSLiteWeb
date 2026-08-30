import type { Metadata } from "next";
import { PosPage } from "@/features/pos/pos-page";

export const metadata: Metadata = {
  title: "POS",
};

export default function PosRoute() {
  return <PosPage />;
}
