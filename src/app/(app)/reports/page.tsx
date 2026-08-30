import type { Metadata } from "next";
import { ReportsHomePage } from "@/features/reports/reports-home-page";

export const metadata: Metadata = {
  title: "Reports",
};

export default function ReportsRoute() {
  return <ReportsHomePage />;
}
