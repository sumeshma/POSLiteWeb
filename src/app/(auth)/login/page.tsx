import { Suspense } from "react";
import { LoginForm } from "@/features/auth/login-form";
import { GuestGuard } from "@/components/auth/guest-guard";
import { BrandLogo } from "@/components/layout/brand-logo";
import { PageLoading } from "@/components/shared/page-loading";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";

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
        <div className="relative flex min-h-svh items-center justify-center bg-background p-4 md:p-8">
          <Card className="relative w-full max-w-md shadow-md">
            <CardHeader className="space-y-4">
              <BrandLogo className="h-12" priority />
              <CardDescription>Sign in with your shop code, username, and password.</CardDescription>
            </CardHeader>
            <CardContent>
              <LoginForm />
            </CardContent>
          </Card>
        </div>
      </GuestGuard>
    </Suspense>
  );
}
