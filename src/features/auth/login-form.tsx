"use client";

import { useState, useSyncExternalStore, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Eye, EyeOff, Loader2, Lock, UserRound } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getLastShopCode } from "@/lib/session";
import { getErrorMessage } from "@/types/api";
import { loginSchema, type LoginFormValues } from "@/features/auth/login-schema";
import { cn } from "@/lib/utils";

function Field({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute top-1/2 left-3 z-10 -translate-y-1/2 text-muted-foreground">
        {icon}
      </span>
      {children}
    </div>
  );
}

function useLastShopCode(): string {
  return useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener("storage", onStoreChange);
      return () => window.removeEventListener("storage", onStoreChange);
    },
    () => getLastShopCode(),
    () => "",
  );
}

const inputClass = "h-11 bg-muted/40 pl-10";

export function LoginForm() {
  const { login } = useAuth();
  const searchParams = useSearchParams();
  const lastShopCode = useLastShopCode();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(
    searchParams.get("reason") === "session"
      ? "Your session has expired. Please sign in again."
      : null,
  );

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      shopCode: lastShopCode,
      username: "",
      password: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(values: LoginFormValues) {
    setFormError(null);
    try {
      await login(values);
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  }

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
      {formError ? (
        <Alert variant="destructive">
          <AlertTitle>Unable to sign in</AlertTitle>
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="shopCode">Shop code</Label>
        <Field icon={<Building2 className="size-4" aria-hidden="true" />}>
          <Input
            id="shopCode"
            autoComplete="organization"
            autoCapitalize="characters"
            spellCheck={false}
            disabled={isSubmitting}
            aria-invalid={Boolean(form.formState.errors.shopCode)}
            placeholder="Enter shop code"
            className={inputClass}
            {...form.register("shopCode")}
          />
        </Field>
        {form.formState.errors.shopCode ? (
          <p className="text-sm text-destructive">{form.formState.errors.shopCode.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Field icon={<UserRound className="size-4" aria-hidden="true" />}>
          <Input
            id="username"
            autoComplete="username"
            disabled={isSubmitting}
            aria-invalid={Boolean(form.formState.errors.username)}
            placeholder="Enter username"
            className={inputClass}
            {...form.register("username")}
          />
        </Field>
        {form.formState.errors.username ? (
          <p className="text-sm text-destructive">{form.formState.errors.username.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Field icon={<Lock className="size-4" aria-hidden="true" />}>
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            disabled={isSubmitting}
            placeholder="Enter password"
            className={cn(inputClass, "pr-10")}
            aria-invalid={Boolean(form.formState.errors.password)}
            {...form.register("password")}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute top-1/2 right-1.5 z-10 -translate-y-1/2"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </Button>
        </Field>
        {form.formState.errors.password ? (
          <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
        ) : null}
      </div>

      <Button
        type="submit"
        className="h-11 w-full bg-brand-gradient text-sm font-semibold text-white hover:opacity-95"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign in"
        )}
      </Button>
    </form>
  );
}
