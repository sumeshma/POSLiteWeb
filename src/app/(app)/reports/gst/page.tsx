import type { Metadata } from "next";
import { GstReportPage } from "@/features/reports/gst-report-page";

export const metadata: Metadata = {
  title: "GST report",
};

export default function GstReportRoute() {
  return <GstReportPage />;
}
