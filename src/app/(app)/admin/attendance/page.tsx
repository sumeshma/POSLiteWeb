import type { Metadata } from "next";
import { AttendancePage } from "@/features/attendance/attendance-page";

export const metadata: Metadata = {
  title: "Attendance",
};

export default function AttendanceRoute() {
  return <AttendancePage />;
}
