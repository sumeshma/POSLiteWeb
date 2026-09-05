import type { Metadata } from "next";
import { SsoCallbackPage } from "@/features/auth/sso-callback-page";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function SsoCallbackRoute() {
  return <SsoCallbackPage />;
}
