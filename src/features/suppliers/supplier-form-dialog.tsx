"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Truck } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { FormDialog } from "@/components/shared/form-dialog";
import { FormField } from "@/components/shared/form-field";
import { LoadingState } from "@/components/shared/loading-state";
import { emptyToNull } from "@/lib/empty";
import { getMutationErrorMessage, isValidationError } from "@/lib/mutation-errors";
import type { Supplier } from "@/types/supplier";
import { useSupplierMutations, useSupplierQuery } from "./use-suppliers";
import {
  emptySupplierForm,
  supplierFormSchema,
  type SupplierFormValues,
} from "./supplier-schema";

type SupplierFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplierId: string | null;
};

function toRequest(values: SupplierFormValues) {
  return {
    name: values.name.trim(),
    contactPerson: emptyToNull(values.contactPerson),
    phoneNumber: emptyToNull(values.phoneNumber),
    email: emptyToNull(values.email),
    address: emptyToNull(values.address),
  };
}

function fromSupplier(supplier: Supplier): SupplierFormValues {
  return {
    name: supplier.name ?? "",
    contactPerson: supplier.contactPerson ?? "",
    phoneNumber: supplier.phoneNumber ?? "",
    email: supplier.email ?? "",
    address: supplier.address ?? "",
    isActive: supplier.isActive,
  };
}

export function SupplierFormDialog({
  open,
  onOpenChange,
  supplierId,
}: SupplierFormDialogProps) {
  const isEdit = Boolean(supplierId);
  const detailQuery = useSupplierQuery(open && isEdit ? supplierId : null);
  const mutations = useSupplierMutations();

  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: emptySupplierForm,
  });

  useEffect(() => {
    if (!open) {
      form.reset(emptySupplierForm);
      return;
    }
    if (isEdit && detailQuery.data) {
      form.reset(fromSupplier(detailQuery.data));
    }
    if (!isEdit) {
      form.reset(emptySupplierForm);
    }
  }, [open, isEdit, detailQuery.data, form]);

  const isSubmitting = mutations.create.isPending || mutations.update.isPending;

  async function onSubmit(values: SupplierFormValues) {
    try {
      if (isEdit && supplierId) {
        await mutations.update.mutateAsync({
          id: supplierId,
          body: { ...toRequest(values), isActive: values.isActive },
        });
        toast.success("Supplier updated successfully.");
        onOpenChange(false);
        return;
      }

      await mutations.create.mutateAsync(toRequest(values));
      toast.success("Supplier created successfully.");
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
      title={isEdit ? "Edit supplier" : "Add supplier"}
      description="Supplier contact details used for purchasing later."
      icon={Truck}
      size="md"
      isDirty={form.formState.isDirty}
      isSubmitting={isSubmitting}
      submitLabel={isEdit ? "Update" : "Create"}
      onSubmit={form.handleSubmit(onSubmit)}
    >
      {isEdit && detailQuery.isLoading ? (
        <LoadingState label="Loading supplier..." />
      ) : (
        <>
          {form.formState.errors.root?.message ? (
            <Alert variant="destructive">
              <AlertDescription>{form.formState.errors.root.message}</AlertDescription>
            </Alert>
          ) : null}

          <FormField
            label="Name"
            htmlFor="supplier-name"
            required
            error={form.formState.errors.name?.message}
          >
            <Input id="supplier-name" disabled={isSubmitting} {...form.register("name")} />
          </FormField>
          <FormField label="Contact person" htmlFor="supplier-contact">
            <Input
              id="supplier-contact"
              disabled={isSubmitting}
              {...form.register("contactPerson")}
            />
          </FormField>
          <FormField label="Phone" htmlFor="supplier-phone">
            <Input
              id="supplier-phone"
              disabled={isSubmitting}
              {...form.register("phoneNumber")}
            />
          </FormField>
          <FormField label="Email" htmlFor="supplier-email">
            <Input id="supplier-email" disabled={isSubmitting} {...form.register("email")} />
          </FormField>
          <FormField label="Address" htmlFor="supplier-address">
            <Textarea
              id="supplier-address"
              disabled={isSubmitting}
              {...form.register("address")}
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
        </>
      )}
    </FormDialog>
  );
}
