"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tags } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormDialog } from "@/components/shared/form-dialog";
import { FormField } from "@/components/shared/form-field";
import { ImageField } from "@/components/shared/image-field";
import { LoadingState } from "@/components/shared/loading-state";
import { emptyToNull } from "@/lib/empty";
import { getMutationErrorMessage, isValidationError } from "@/lib/mutation-errors";
import { toast } from "sonner";
import { useCategoryMutations, useCategoryQuery, useCategoriesQuery } from "./use-categories";
import {
  categoryFormSchema,
  emptyCategoryForm,
  type CategoryFormValues,
} from "./category-schema";
import type { Category } from "@/types/category";

type CategoryFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId: string | null;
};

function toRequest(values: CategoryFormValues) {
  return {
    name: values.name.trim(),
    parentCategoryId: emptyToNull(values.parentCategoryId),
    description: emptyToNull(values.description),
    imageUrl: emptyToNull(values.imageUrl),
    defaultShowOnPos: values.defaultShowOnPos,
  };
}

function fromCategory(category: Category): CategoryFormValues {
  return {
    name: category.name ?? "",
    parentCategoryId: category.parentCategoryId ?? "",
    description: category.description ?? "",
    imageUrl: category.imageUrl ?? "",
    defaultShowOnPos: category.defaultShowOnPos,
    isActive: category.isActive,
  };
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  categoryId,
}: CategoryFormDialogProps) {
  const isEdit = Boolean(categoryId);
  const detailQuery = useCategoryQuery(open && isEdit ? categoryId : null);
  const categoriesQuery = useCategoriesQuery({});
  const mutations = useCategoryMutations();

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: emptyCategoryForm,
  });

  useEffect(() => {
    if (!open) {
      form.reset(emptyCategoryForm);
      return;
    }

    if (isEdit && detailQuery.data) {
      form.reset(fromCategory(detailQuery.data));
    }

    if (!isEdit) {
      form.reset(emptyCategoryForm);
    }
  }, [open, isEdit, detailQuery.data, form]);

  const isSubmitting = mutations.create.isPending || mutations.update.isPending;
  const parentOptions = (categoriesQuery.data ?? []).filter(
    (category) => category.id !== categoryId,
  );

  async function onSubmit(values: CategoryFormValues) {
    try {
      if (isEdit && categoryId) {
        const result = await mutations.update.mutateAsync({
          id: categoryId,
          body: { ...toRequest(values), isActive: values.isActive },
        });
        toast.success("Category updated successfully.");
        onOpenChange(false);
        return result;
      }

      await mutations.create.mutateAsync(toRequest(values));
      toast.success("Category created successfully.");
      onOpenChange(false);
    } catch (error) {
      const message = getMutationErrorMessage(error);
      form.setError("root", { message });
      if (!isValidationError(error)) {
        toast.error("Unable to save changes");
      }
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit category" : "Add category"}
      description="Categories group products in the catalog and on POS."
      icon={Tags}
      size="md"
      isDirty={form.formState.isDirty}
      isSubmitting={isSubmitting}
      submitLabel={isEdit ? "Update" : "Create"}
      onSubmit={form.handleSubmit(onSubmit)}
    >
      {isEdit && detailQuery.isLoading ? (
        <LoadingState label="Loading category..." />
      ) : (
        <>
          {form.formState.errors.root?.message ? (
            <Alert variant="destructive">
              <AlertDescription>{form.formState.errors.root.message}</AlertDescription>
            </Alert>
          ) : null}

          <FormField
            label="Name"
            htmlFor="category-name"
            required
            error={form.formState.errors.name?.message}
          >
            <Input
              id="category-name"
              disabled={isSubmitting}
              aria-invalid={Boolean(form.formState.errors.name)}
              {...form.register("name")}
            />
          </FormField>

          <FormField label="Parent category" htmlFor="category-parent">
            <Controller
              control={form.control}
              name="parentCategoryId"
              render={({ field }) => (
                <Select
                  value={field.value || "__none__"}
                  onValueChange={(value) =>
                    field.onChange(value === "__none__" || value == null ? "" : value)
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="category-parent" className="w-full">
                    <SelectValue placeholder="None (top-level)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None (top-level)</SelectItem>
                    {parentOptions.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>

          <FormField
            label="Description"
            htmlFor="category-description"
            error={form.formState.errors.description?.message}
          >
            <Textarea
              id="category-description"
              disabled={isSubmitting}
              {...form.register("description")}
            />
          </FormField>

          <FormField label="Image">
            <Controller
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <ImageField
                  value={field.value || null}
                  onChange={(value) => field.onChange(value ?? "")}
                  disabled={isSubmitting}
                />
              )}
            />
          </FormField>

          <FormField label="Show on POS by default">
            <Controller
              control={form.control}
              name="defaultShowOnPos"
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
