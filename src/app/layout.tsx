import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist } from "next/font/google";
import { Providers } from "@/components/providers";
import { appConfig } from "@/config/app";
import { cn } from "@/lib/utils";
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export const metadata: Metadata = {
  title: {
    default: appConfig.name,
    template: `%s · ${appConfig.name}`,
  },
  description: appConfig.description,
};

/**
 * Root layout holds shared providers only.
 * Authenticated application pages use the (app) route group and AppShell.
 * POS Machine Mode uses the (pos-machine) route group so it can omit the
 * persistent sidebar while sharing providers, API, and POS business logic.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={cn("font-sans", geistSans.variable)}
      data-theme="purple-teal"
      suppressHydrationWarning
    >
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
