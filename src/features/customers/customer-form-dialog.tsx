"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Users } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { FormDialog } from "@/components/shared/form-dialog";
import { FormField } from "@/components/shared/form-field";
import { LoadingState } from "@/components/shared/loading-state";
import { emptyToNull } from "@/lib/empty";
import { getMutationErrorMessage, isValidationError } from "@/lib/mutation-errors";
import type { Customer } from "@/types/customer";
import { useCustomerMutations, useCustomerQuery } from "./use-customers";
import {
  customerFormSchema,
  emptyCustomerForm,
  type CustomerFormValues,
} from "./customer-schema";

type CustomerFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string | null;
  onCreated?: (customer: Customer) => void;
};

function toRequest(values: CustomerFormValues) {
  return {
    name: values.name.trim(),
    phone: values.phone.trim(),
    email: emptyToNull(values.email),
  };
}

function fromCustomer(customer: Customer): CustomerFormValues {
  return {
    name: customer.name ?? "",
    phone: customer.phone ?? "",
    email: customer.email ?? "",
    isActive: customer.isActive,
  };
}

export function CustomerFormDialog({
  open,
  onOpenChange,
  customerId,
  onCreated,
}: CustomerFormDialogProps) {
  const isEdit = Boolean(customerId);
  const detailQuery = useCustomerQuery(open && isEdit ? customerId : null);
  const mutations = useCustomerMutations();

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: emptyCustomerForm,
  });

  useEffect(() => {
    if (!open) {
      form.reset(emptyCustomerForm);
      return;
    }
    if (isEdit && detailQuery.data) {
      form.reset(fromCustomer(detailQuery.data));
    }
    if (!isEdit) {
      form.reset(emptyCustomerForm);
    }
  }, [open, isEdit, detailQuery.data, form]);

  const isSubmitting = mutations.create.isPending || mutations.update.isPending;

  async function onSubmit(values: CustomerFormValues) {
    try {
      if (isEdit && customerId) {
        await mutations.update.mutateAsync({
          id: customerId,
          body: { ...toRequest(values), isActive: values.isActive },
        });
        toast.success("Customer updated successfully.");
        onOpenChange(false);
        return;
      }

      const created = await mutations.create.mutateAsync(toRequest(values));
      toast.success("Customer created successfully.");
      onCreated?.(created);
      onOpenChange(false);
    } catch (error) {
      form.setError("root", { message: getMutationErrorMessage(error) });
      if (!isValidationError(error)) {
        toast.error("Unable to save changes");
      }
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit customer" : "Add customer"}
      description="Customer contact details used at checkout."
      icon={Users}
      size="md"
      isDirty={form.formState.isDirty}
      isSubmitting={isSubmitting}
      submitLabel={isEdit ? "Update" : "Create"}
      onSubmit={form.handleSubmit(onSubmit)}
    >
      {isEdit && detailQuery.isLoading ? (
        <LoadingState label="Loading customer..." />
      ) : (
        <>
          {form.formState.errors.root?.message ? (
            <Alert variant="destructive">
              <AlertDescription>{form.formState.errors.root.message}</AlertDescription>
            </Alert>
          ) : null}

          <FormField
            label="Name"
            htmlFor="customer-name"
            required
            error={form.formState.errors.name?.message}
          >
            <Input id="customer-name" disabled={isSubmitting} {...form.register("name")} />
          </FormField>
          <FormField
            label="Phone"
            htmlFor="customer-phone"
            required
            error={form.formState.errors.phone?.message}
          >
            <Input
              id="customer-phone"
              inputMode="numeric"
              disabled={isSubmitting}
              {...form.register("phone")}
            />
          </FormField>
          <FormField
            label="Email"
            htmlFor="customer-email"
            error={form.formState.errors.email?.message}
          >
            <Input id="customer-email" disabled={isSubmitting} {...form.register("email")} />
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
        </>
      )}
    </FormDialog>
  );
}
