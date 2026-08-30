"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { LogOut } from "lucide-react";
import { FormDialog } from "@/components/shared/form-dialog";
import { FormField } from "@/components/shared/form-field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { emptyToNull } from "@/lib/empty";
import { getMutationErrorMessage } from "@/lib/mutation-errors";
import { getShopUserDisplayName, type ShopUser } from "@/types/user";
import { useUserMutations } from "./use-users";

type ForceLogoutDialogProps = {
  user: ShopUser | null;
  onOpenChange: (open: boolean) => void;
};

type ForceLogoutValues = {
  reason: string;
};

export function ForceLogoutDialog({ user, onOpenChange }: ForceLogoutDialogProps) {
  const open = Boolean(user);
  const mutations = useUserMutations();
  const form = useForm<ForceLogoutValues>({
    defaultValues: { reason: "" },
  });

  useEffect(() => {
    if (!open) {
      form.reset({ reason: "" });
    }
  }, [open, form]);

  async function onSubmit(values: ForceLogoutValues) {
    if (!user) {
      return;
    }

    try {
      await mutations.forceLogout.mutateAsync({
        id: user.id,
        body: { reason: emptyToNull(values.reason) },
      });
      toast.success("User was signed out.");
      onOpenChange(false);
    } catch (error) {
      form.setError("root", { message: getMutationErrorMessage(error) });
      toast.error("Unable to force logout");
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Force logout"
      icon={LogOut}
      description={
        user
          ? `Sign out ${getShopUserDisplayName(user)} from active sessions. A reason is optional.`
          : undefined
      }
      size="sm"
      isDirty={form.formState.isDirty}
      isSubmitting={mutations.forceLogout.isPending}
      submitLabel="Force logout"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      {form.formState.errors.root?.message ? (
        <Alert variant="destructive">
          <AlertDescription>{form.formState.errors.root.message}</AlertDescription>
        </Alert>
      ) : null}
      <FormField label="Reason" htmlFor="force-logout-reason">
        <Input
          id="force-logout-reason"
          disabled={mutations.forceLogout.isPending}
          {...form.register("reason")}
        />
      </FormField>
    </FormDialog>
  );
}
