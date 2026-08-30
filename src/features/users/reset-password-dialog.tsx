"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";
import { FormDialog } from "@/components/shared/form-dialog";
import { FormField } from "@/components/shared/form-field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { getMutationErrorMessage, isValidationError } from "@/lib/mutation-errors";
import { getShopUserDisplayName, type ShopUser } from "@/types/user";
import { toUpdateUserRequestFromShopUser } from "./user-mappers";
import { resetPasswordSchema, type ResetPasswordValues } from "./user-schema";
import { useUserMutations } from "./use-users";

type ResetPasswordDialogProps = {
  user: ShopUser | null;
  onOpenChange: (open: boolean) => void;
};

export function ResetPasswordDialog({ user, onOpenChange }: ResetPasswordDialogProps) {
  const open = Boolean(user);
  const mutations = useUserMutations();
  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (!open) {
      form.reset({ newPassword: "", confirmPassword: "" });
    }
  }, [open, form]);

  async function onSubmit(values: ResetPasswordValues) {
    if (!user) {
      return;
    }

    try {
      await mutations.update.mutateAsync({
        id: user.id,
        body: toUpdateUserRequestFromShopUser(user, { newPassword: values.newPassword }),
      });
      toast.success("Password reset successfully.");
      form.reset({ newPassword: "", confirmPassword: "" });
      onOpenChange(false);
    } catch (error) {
      form.setError("root", { message: getMutationErrorMessage(error) });
      if (!isValidationError(error)) {
        toast.error("Unable to reset password");
      }
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Reset password"
      icon={KeyRound}
      description={
        user
          ? `Set a new password for ${getShopUserDisplayName(user)}. Complexity rules are enforced by the backend.`
          : undefined
      }
      size="sm"
      isDirty={form.formState.isDirty}
      isSubmitting={mutations.update.isPending}
      submitLabel="Reset password"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      {form.formState.errors.root?.message ? (
        <Alert variant="destructive">
          <AlertDescription>{form.formState.errors.root.message}</AlertDescription>
        </Alert>
      ) : null}
      <FormField
        label="New password"
        htmlFor="reset-new-password"
        required
        error={form.formState.errors.newPassword?.message}
      >
        <Input
          id="reset-new-password"
          type="password"
          autoComplete="new-password"
          disabled={mutations.update.isPending}
          {...form.register("newPassword")}
        />
      </FormField>
      <FormField
        label="Confirm password"
        htmlFor="reset-confirm-password"
        required
        error={form.formState.errors.confirmPassword?.message}
      >
        <Input
          id="reset-confirm-password"
          type="password"
          autoComplete="new-password"
          disabled={mutations.update.isPending}
          {...form.register("confirmPassword")}
        />
      </FormField>
    </FormDialog>
  );
}
