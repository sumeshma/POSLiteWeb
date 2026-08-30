"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Settings } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { FormDialog } from "@/components/shared/form-dialog";
import { FormField } from "@/components/shared/form-field";
import { LoadingState } from "@/components/shared/loading-state";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { emptyToNull } from "@/lib/empty";
import { getMutationErrorMessage, isValidationError } from "@/lib/mutation-errors";
import { updateSessionUser } from "@/lib/session";
import { toAuthUser } from "@/types/user";
import { profileFormSchema, type ProfileFormValues } from "./account-schema";
import { useCurrentUserQuery, useProfileMutations } from "@/features/users/use-users";

type ProfileDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  const { user } = useAuth();
  const profileQuery = useCurrentUserQuery({ enabled: open });
  const mutations = useProfileMutations();
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
    },
  });

  useEffect(() => {
    if (!open) {
      return;
    }
    const source = profileQuery.data ?? user;
    if (source) {
      form.reset({
        firstName: source.firstName ?? "",
        lastName: source.lastName ?? "",
        email: source.email ?? "",
        phoneNumber: source.phoneNumber ?? "",
      });
    }
  }, [form, open, profileQuery.data, user]);

  async function onSubmit(values: ProfileFormValues) {
    try {
      const updated = await mutations.updateProfile.mutateAsync({
        firstName: emptyToNull(values.firstName),
        lastName: emptyToNull(values.lastName),
        email: emptyToNull(values.email),
        phoneNumber: emptyToNull(values.phoneNumber),
      });
      updateSessionUser(toAuthUser(updated));
      toast.success("Profile updated successfully.");
      onOpenChange(false);
    } catch (error) {
      form.setError("root", { message: getMutationErrorMessage(error) });
      if (!isValidationError(error)) {
        toast.error("Unable to update profile");
      }
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Settings"
      description="Update the name, email, and phone number on your account."
      icon={Settings}
      size="md"
      isDirty={form.formState.isDirty}
      isSubmitting={mutations.updateProfile.isPending}
      submitLabel="Save"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      {profileQuery.isLoading ? (
        <LoadingState label="Loading profile..." />
      ) : (
        <>
          {form.formState.errors.root?.message ? (
            <Alert variant="destructive">
              <AlertDescription>{form.formState.errors.root.message}</AlertDescription>
            </Alert>
          ) : null}
          <FormField label="First name" htmlFor="profile-first-name">
            <Input
              id="profile-first-name"
              disabled={mutations.updateProfile.isPending}
              {...form.register("firstName")}
            />
          </FormField>
          <FormField label="Last name" htmlFor="profile-last-name">
            <Input
              id="profile-last-name"
              disabled={mutations.updateProfile.isPending}
              {...form.register("lastName")}
            />
          </FormField>
          <FormField
            label="Email"
            htmlFor="profile-email"
            error={form.formState.errors.email?.message}
          >
            <Input
              id="profile-email"
              disabled={mutations.updateProfile.isPending}
              {...form.register("email")}
            />
          </FormField>
          <FormField label="Phone" htmlFor="profile-phone">
            <Input
              id="profile-phone"
              disabled={mutations.updateProfile.isPending}
              {...form.register("phoneNumber")}
            />
          </FormField>
        </>
      )}
    </FormDialog>
  );
}
