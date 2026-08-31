"use client";

import { useState, useSyncExternalStore } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { appConfig } from "@/config/app";
import { getLastShopCode } from "@/lib/session";
import { getErrorMessage } from "@/types/api";
import { loginSchema, type LoginFormValues } from "@/features/auth/login-schema";

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
    <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
      {formError ? (
        <Alert variant="destructive">
          <AlertTitle>Unable to sign in</AlertTitle>
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="shopCode">Shop code</Label>
        <Input
          id="shopCode"
          autoComplete="organization"
          autoCapitalize="characters"
          spellCheck={false}
          disabled={isSubmitting}
          aria-invalid={Boolean(form.formState.errors.shopCode)}
          placeholder="Enter shop code"
          {...form.register("shopCode")}
        />
        {form.formState.errors.shopCode ? (
          <p className="text-sm text-destructive">{form.formState.errors.shopCode.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          autoComplete="username"
          disabled={isSubmitting}
          aria-invalid={Boolean(form.formState.errors.username)}
          {...form.register("username")}
        />
        {form.formState.errors.username ? (
          <p className="text-sm text-destructive">{form.formState.errors.username.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            disabled={isSubmitting}
            className="pr-9"
            aria-invalid={Boolean(form.formState.errors.password)}
            {...form.register("password")}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute top-1/2 right-1 -translate-y-1/2"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </Button>
        </div>
        {form.formState.errors.password ? (
          <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
        ) : null}
      </div>

      <Button type="submit" className="h-10 w-full bg-brand-gradient text-white" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign in"
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground">{appConfig.name}</p>
    </form>
  );
}
