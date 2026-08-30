"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
import { PermissionChecklist } from "@/components/shared/permission-checklist";
import { FormDialog } from "@/components/shared/form-dialog";
import { FormField } from "@/components/shared/form-field";
import { LoadingState } from "@/components/shared/loading-state";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { emptyToNull } from "@/lib/empty";
import { getMutationErrorMessage, isValidationError } from "@/lib/mutation-errors";
import { usePermissionCatalogQuery } from "@/features/users/use-users";
import { emptyRoleForm, roleFormSchema, type RoleFormValues } from "./role-schema";
import { useRoleMutations, useRoleQuery } from "./use-roles";

type RoleFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roleId: string | null;
};

export function RoleFormDialog({ open, onOpenChange, roleId }: RoleFormDialogProps) {
  const isEdit = Boolean(roleId);
  const detailQuery = useRoleQuery(open && isEdit ? roleId : null);
  const catalogQuery = usePermissionCatalogQuery({ enabled: open });
  const mutations = useRoleMutations();
  const catalog = catalogQuery.data ?? [];

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: emptyRoleForm,
  });

  useEffect(() => {
    if (!open) {
      form.reset(emptyRoleForm);
      return;
    }
    if (isEdit && detailQuery.data) {
      form.reset({
        name: detailQuery.data.name ?? "",
        description: detailQuery.data.description ?? "",
        isActive: detailQuery.data.isActive,
        permissions: detailQuery.data.permissions ?? [],
      });
    }
    if (!isEdit) {
      form.reset(emptyRoleForm);
    }
  }, [open, isEdit, detailQuery.data, form]);

  const isSubmitting = mutations.create.isPending || mutations.update.isPending;

  async function onSubmit(values: RoleFormValues) {
    const body = {
      name: values.name.trim(),
      description: emptyToNull(values.description),
      isActive: values.isActive,
      permissions: values.permissions,
    };

    try {
      if (isEdit && roleId) {
        await mutations.update.mutateAsync({ id: roleId, body });
        toast.success("Role updated successfully.");
        onOpenChange(false);
        return;
      }

      await mutations.create.mutateAsync(body);
      toast.success("Role created successfully.");
      onOpenChange(false);
    } catch (error) {
      form.setError("root", { message: getMutationErrorMessage(error) });
      if (!isValidationError(error)) {
        toast.error("Unable to save role");
      }
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit role" : "Add role"}
      description="Permissions are limited to keys returned by the backend catalog."
      icon={ShieldCheck}
      size="lg"
      isDirty={form.formState.isDirty}
      isSubmitting={isSubmitting}
      submitLabel={isEdit ? "Update" : "Create"}
      onSubmit={form.handleSubmit(onSubmit)}
    >
      {isEdit && detailQuery.isLoading ? (
        <LoadingState label="Loading role..." />
      ) : (
        <>
          {form.formState.errors.root?.message ? (
            <Alert variant="destructive">
              <AlertDescription>{form.formState.errors.root.message}</AlertDescription>
            </Alert>
          ) : null}
          <FormField
            label="Name"
            htmlFor="role-name"
            required
            error={form.formState.errors.name?.message}
          >
            <Input id="role-name" disabled={isSubmitting} {...form.register("name")} />
          </FormField>
          <FormField label="Description" htmlFor="role-description">
            <Textarea id="role-description" disabled={isSubmitting} {...form.register("description")} />
          </FormField>
          <FormField label="Active">
            <Controller
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <div className="flex h-8 items-center">
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting}
                  />
                </div>
              )}
            />
          </FormField>
          <div className="space-y-2">
            <p className="text-sm font-medium">Permissions</p>
            {catalogQuery.isLoading ? (
              <LoadingState label="Loading permissions..." />
            ) : (
              <Controller
                control={form.control}
                name="permissions"
                render={({ field }) => (
                  <PermissionChecklist
                    catalog={catalog}
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isSubmitting}
                  />
                )}
              />
            )}
          </div>
        </>
      )}
    </FormDialog>
  );
}
