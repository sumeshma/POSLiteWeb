import { Suspense } from "react";
import { BarChart3, Package, ShoppingCart } from "lucide-react";
import { LoginForm } from "@/features/auth/login-form";
import { GuestGuard } from "@/components/auth/guest-guard";
import { BrandLogo } from "@/components/layout/brand-logo";
import { PageLoading } from "@/components/shared/page-loading";
import { appConfig } from "@/config/app";
import { cn } from "@/lib/utils";

const highlights = [
  {
    icon: ShoppingCart,
    title: "Counter sales",
    description: "Search, scan, and check out from the browser.",
  },
  {
    icon: Package,
    title: "Stock in view",
    description: "Keep inventory, purchases, and alerts together.",
  },
  {
    icon: BarChart3,
    title: "Shop reports",
    description: "See sales, GST, and P&L without leaving the app.",
  },
] as const;

function LoginBrandPanel({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative isolate overflow-hidden bg-brand-gradient text-white",
        className,
      )}
    >
      <div className="pointer-events-none absolute -top-24 -left-16 size-72 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute right-[-4rem] bottom-[-5rem] size-96 rounded-full bg-black/15" />
      <div className="pointer-events-none absolute top-1/3 right-12 size-40 rounded-full border border-white/15" />

      <div className="relative flex h-full flex-col justify-between gap-10 p-8 lg:p-12">
        <div className="inline-flex w-fit items-center rounded-xl bg-white px-3 py-2 shadow-sm">
          <BrandLogo className="h-9" priority />
        </div>

        <div className="max-w-md space-y-4">
          <p className="text-sm font-medium tracking-wide text-white/80 uppercase">
            {appConfig.shortName}
          </p>
          <h1 className="text-3xl leading-tight font-semibold lg:text-4xl">
            Sell, stock, and run your shop from one place.
          </h1>
          <p className="text-sm leading-6 text-white/80 lg:text-base">
            Sign in with your shop code to open POS, inventory, and reports in the
            browser.
          </p>
        </div>

        <ul className="grid gap-3">
          {highlights.map((item) => (
            <li
              key={item.title}
              className="flex items-start gap-3 rounded-xl bg-white/10 px-3 py-3 ring-1 ring-white/15"
            >
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/15">
                <item.icon className="size-4" aria-hidden="true" />
              </span>
              <span>
                <p className="font-medium">{item.title}</p>
                <p className="text-xs leading-5 text-white/75">{item.description}</p>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-svh items-center justify-center p-6">
          <PageLoading />
        </div>
      }
    >
      <GuestGuard>
        <div className="grid min-h-svh bg-background lg:grid-cols-[minmax(18rem,0.92fr)_minmax(28rem,1fr)]">
          <LoginBrandPanel className="hidden lg:flex" />

          <div className="relative flex min-h-svh flex-col">
            <div className="pointer-events-none absolute inset-0 bg-brand-gradient opacity-[0.07] lg:hidden" />

            <div className="relative flex flex-1 items-center justify-center p-4 md:p-8">
              <div className="w-full max-w-md">
                <div className="mb-5 flex justify-center lg:hidden">
                  <div className="inline-flex items-center rounded-xl bg-white px-3 py-2 shadow-sm ring-1 ring-foreground/10">
                    <BrandLogo className="h-9" priority />
                  </div>
                </div>

                <div className="overflow-hidden rounded-xl bg-card text-card-foreground shadow-sm ring-1 ring-foreground/10">
                  <div className="h-1.5 bg-brand-gradient" />
                  <div className="space-y-6 p-6 md:p-8">
                    <div className="space-y-1.5">
                      <h2 className="text-xl font-semibold tracking-tight">Welcome back</h2>
                      <p className="text-sm text-muted-foreground">
                        Sign in with your shop code, username, and password.
                      </p>
                    </div>
                    <LoginForm />
                  </div>
                </div>
                <p className="mt-4 text-center text-xs text-muted-foreground">
                  Powered by Swiftpro Solutions Pvt Ltd
                </p>
              </div>
            </div>
          </div>
        </div>
      </GuestGuard>
    </Suspense>
  );
}
