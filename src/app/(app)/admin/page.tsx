import type { Metadata } from "next";
import { AdminHomePage } from "@/features/admin/admin-home-page";

export const metadata: Metadata = {
  title: "Administration",
};

export default function AdminRoute() {
  return <AdminHomePage />;
}
