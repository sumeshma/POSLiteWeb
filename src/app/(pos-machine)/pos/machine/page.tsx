import type { Metadata } from "next";
import { PosMachinePage } from "@/features/pos/pos-machine-page";

export const metadata: Metadata = {
  title: "POS Machine Mode",
};

export default function PosMachineRoute() {
  return <PosMachinePage />;
}
