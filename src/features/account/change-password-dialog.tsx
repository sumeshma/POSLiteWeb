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
import { changePasswordSchema, type ChangePasswordValues } from "./account-schema";
import { useProfileMutations } from "@/features/users/use-users";

type ChangePasswordDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ChangePasswordDialog({ open, onOpenChange }: ChangePasswordDialogProps) {
  const mutations = useProfileMutations();
  const form = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  }, [open, form]);

  async function onSubmit(values: ChangePasswordValues) {
    try {
      await mutations.changePassword.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      toast.success("Password changed successfully.");
      form.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      onOpenChange(false);
    } catch (error) {
      form.setError("root", { message: getMutationErrorMessage(error) });
      if (!isValidationError(error)) {
        toast.error("Unable to change password");
      }
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Change password"
      description="Password complexity is enforced by the backend. The new password is not shown after it is saved."
      icon={KeyRound}
      size="sm"
      isDirty={form.formState.isDirty}
      isSubmitting={mutations.changePassword.isPending}
      submitLabel="Change password"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      {form.formState.errors.root?.message ? (
        <Alert variant="destructive">
          <AlertDescription>{form.formState.errors.root.message}</AlertDescription>
        </Alert>
      ) : null}
      <FormField
        label="Current password"
        htmlFor="current-password"
        required
        error={form.formState.errors.currentPassword?.message}
      >
        <Input
          id="current-password"
          type="password"
          autoComplete="current-password"
          disabled={mutations.changePassword.isPending}
          {...form.register("currentPassword")}
        />
      </FormField>
      <FormField
        label="New password"
        htmlFor="new-password"
        required
        error={form.formState.errors.newPassword?.message}
      >
        <Input
          id="new-password"
          type="password"
          autoComplete="new-password"
          disabled={mutations.changePassword.isPending}
          {...form.register("newPassword")}
        />
      </FormField>
      <FormField
        label="Confirm new password"
        htmlFor="confirm-new-password"
        required
        error={form.formState.errors.confirmPassword?.message}
      >
        <Input
          id="confirm-new-password"
          type="password"
          autoComplete="new-password"
          disabled={mutations.changePassword.isPending}
          {...form.register("confirmPassword")}
        />
      </FormField>
    </FormDialog>
  );
}
