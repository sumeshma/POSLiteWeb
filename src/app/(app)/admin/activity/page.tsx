import type { Metadata } from "next";
import { ActivityLogsPage } from "@/features/activity-logs/activity-logs-page";

export const metadata: Metadata = {
  title: "Activity logs",
};

export default function ActivityLogsRoute() {
  return <ActivityLogsPage />;
}
