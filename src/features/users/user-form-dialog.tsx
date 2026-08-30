"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { UserCog } from "lucide-react";
import { PermissionChecklist } from "@/components/shared/permission-checklist";
import { FormDialog } from "@/components/shared/form-dialog";
import { FormField } from "@/components/shared/form-field";
import { LoadingState } from "@/components/shared/loading-state";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { getMutationErrorMessage, isValidationError } from "@/lib/mutation-errors";
import { SYSTEM_IDENTITY_ROLES } from "@/types/user";
import { useRolesQuery } from "@/features/roles/use-roles";
import { fromShopUser, toCreateUserRequest, toUpdateUserRequest } from "./user-mappers";
import { usePermissionCatalogQuery, useUserMutations, useUserQuery } from "./use-users";
import {
  createUserFormSchema,
  emptyUserForm,
  userFormSchema,
  type UserFormValues,
} from "./user-schema";

type UserFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
};

const NONE_ROLE = "__none__";

export function UserFormDialog({ open, onOpenChange, userId }: UserFormDialogProps) {
  const isEdit = Boolean(userId);
  const detailQuery = useUserQuery(open && isEdit ? userId : null);
  const rolesQuery = useRolesQuery({ enabled: open });
  const catalogQuery = usePermissionCatalogQuery({ enabled: open });
  const mutations = useUserMutations();
  const roles = rolesQuery.data ?? [];
  const catalog = catalogQuery.data ?? [];

  const form = useForm<UserFormValues>({
    resolver: zodResolver(isEdit ? userFormSchema : createUserFormSchema),
    defaultValues: emptyUserForm,
  });

  useEffect(() => {
    if (!open) {
      form.reset(emptyUserForm);
      return;
    }
    if (isEdit && detailQuery.data) {
      form.reset(fromShopUser(detailQuery.data));
    }
    if (!isEdit) {
      form.reset(emptyUserForm);
    }
  }, [open, isEdit, detailQuery.data, form]);

  const isSubmitting = mutations.create.isPending || mutations.update.isPending;
  const identityRoles = Array.from(
    new Set([...SYSTEM_IDENTITY_ROLES, detailQuery.data?.role].filter(Boolean)),
  );

  async function onSubmit(values: UserFormValues) {
    try {
      if (isEdit && userId) {
        await mutations.update.mutateAsync({
          id: userId,
          body: toUpdateUserRequest(values),
        });
        toast.success("User updated successfully.");
        onOpenChange(false);
        return;
      }

      await mutations.create.mutateAsync(toCreateUserRequest(values));
      toast.success("User created successfully.");
      onOpenChange(false);
    } catch (error) {
      form.setError("root", { message: getMutationErrorMessage(error) });
      if (!isValidationError(error)) {
        toast.error("Unable to save user");
      }
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit user" : "Add user"}
      description="Identity role is Admin or Employee. App role and permissions come from the backend catalog."
      icon={UserCog}
      size="lg"
      isDirty={form.formState.isDirty}
      isSubmitting={isSubmitting}
      submitLabel={isEdit ? "Update" : "Create"}
      onSubmit={form.handleSubmit(onSubmit)}
    >
      {isEdit && detailQuery.isLoading ? (
        <LoadingState label="Loading user..." />
      ) : (
        <>
          {form.formState.errors.root?.message ? (
            <Alert variant="destructive">
              <AlertDescription>{form.formState.errors.root.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Username"
              htmlFor="user-username"
              required={!isEdit}
              error={form.formState.errors.username?.message}
            >
              <Input
                id="user-username"
                autoComplete="off"
                disabled={isSubmitting || isEdit}
                {...form.register("username")}
              />
            </FormField>
            <FormField label="Email" htmlFor="user-email" error={form.formState.errors.email?.message}>
              <Input id="user-email" disabled={isSubmitting} {...form.register("email")} />
            </FormField>
            <FormField label="First name" htmlFor="user-first-name">
              <Input id="user-first-name" disabled={isSubmitting} {...form.register("firstName")} />
            </FormField>
            <FormField label="Last name" htmlFor="user-last-name">
              <Input id="user-last-name" disabled={isSubmitting} {...form.register("lastName")} />
            </FormField>
            <FormField label="Phone" htmlFor="user-phone">
              <Input id="user-phone" disabled={isSubmitting} {...form.register("phoneNumber")} />
            </FormField>
            <FormField
              label="Identity role"
              htmlFor="user-role"
              required
              error={form.formState.errors.role?.message}
              description="Admin is required for Admin-only API policies."
            >
              <Controller
                control={form.control}
                name="role"
                render={({ field }) => (
                  <Select value={field.value || undefined} onValueChange={(value) => field.onChange(value ?? "")}>
                    <SelectTrigger id="user-role" className="w-full">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {identityRoles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
          </div>

          {!isEdit ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="Password"
                htmlFor="user-password"
                required
                error={form.formState.errors.password?.message}
              >
                <Input
                  id="user-password"
                  type="password"
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  {...form.register("password")}
                />
              </FormField>
              <FormField
                label="Confirm password"
                htmlFor="user-confirm-password"
                required
                error={form.formState.errors.confirmPassword?.message}
              >
                <Input
                  id="user-confirm-password"
                  type="password"
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  {...form.register("confirmPassword")}
                />
              </FormField>
            </div>
          ) : null}

          <FormField label="App role" htmlFor="user-app-role">
            <Controller
              control={form.control}
              name="appRoleId"
              render={({ field }) => (
                <Select
                  value={field.value || NONE_ROLE}
                  onValueChange={(value) => {
                    const nextId = !value || value === NONE_ROLE ? "" : value;
                    field.onChange(nextId);
                    const selected = roles.find((role) => role.id === nextId);
                    if (selected) {
                      form.setValue("permissions", selected.permissions ?? [], { shouldDirty: true });
                    }
                  }}
                >
                  <SelectTrigger id="user-app-role" className="w-full">
                    <SelectValue placeholder="No app role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE_ROLE}>No app role</SelectItem>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name || role.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>

          {isEdit ? (
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
          ) : null}

          <div className="space-y-3 rounded-lg border border-border p-3">
            <p className="text-sm font-medium">Shift</p>
            <FormField label="Shift enabled">
              <Controller
                control={form.control}
                name="shiftEnabled"
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
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Start time" htmlFor="user-shift-start">
                <Input
                  id="user-shift-start"
                  type="time"
                  disabled={isSubmitting}
                  {...form.register("shiftStartTime")}
                />
              </FormField>
              <FormField label="End time" htmlFor="user-shift-end">
                <Input
                  id="user-shift-end"
                  type="time"
                  disabled={isSubmitting}
                  {...form.register("shiftEndTime")}
                />
              </FormField>
              <FormField
                label="Working days"
                htmlFor="user-working-days"
                description="Backend format, for example 0,1,2,3,4,5,6."
              >
                <Input
                  id="user-working-days"
                  disabled={isSubmitting}
                  {...form.register("workingDays")}
                />
              </FormField>
              <FormField label="Allow login outside shift">
                <Controller
                  control={form.control}
                  name="allowLoginOutsideShift"
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
              <FormField label="Grace before (minutes)" htmlFor="user-grace-before">
                <Input
                  id="user-grace-before"
                  type="number"
                  min={0}
                  disabled={isSubmitting}
                  {...form.register("graceBeforeLoginMinutes")}
                />
              </FormField>
              <FormField label="Grace after (minutes)" htmlFor="user-grace-after">
                <Input
                  id="user-grace-after"
                  type="number"
                  min={0}
                  disabled={isSubmitting}
                  {...form.register("graceAfterShiftMinutes")}
                />
              </FormField>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Permissions</p>
            <p className="text-xs text-muted-foreground">
              Only keys returned by the backend permission catalog are shown.
            </p>
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
