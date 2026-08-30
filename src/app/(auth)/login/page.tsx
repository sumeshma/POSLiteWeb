import { LoginForm } from "@/features/auth/login-form";
import { GuestGuard } from "@/components/auth/guest-guard";
import { BrandLogo } from "@/components/layout/brand-logo";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";

type LoginPageProps = {
  searchParams: Promise<{
    reason?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const sessionExpired = params.reason === "session";

  return (
    <GuestGuard>
      <div className="relative flex min-h-svh items-center justify-center bg-background p-4 md:p-8">
        <Card className="relative w-full max-w-md shadow-md">
          <CardHeader className="space-y-4">
            <BrandLogo className="h-12" priority />
            <CardDescription>Sign in with your shop code, username, and password.</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm sessionExpired={sessionExpired} />
          </CardContent>
        </Card>
      </div>
    </GuestGuard>
  );
}
