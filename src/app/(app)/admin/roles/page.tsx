import type { Metadata } from "next";
import { RolesPage } from "@/features/roles/roles-page";

export const metadata: Metadata = {
  title: "Roles",
};

export default function RolesRoute() {
  return <RolesPage />;
}
