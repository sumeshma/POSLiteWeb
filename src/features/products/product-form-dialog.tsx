"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Package } from "lucide-react";
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
import { useCategoriesQuery } from "@/features/categories/use-categories";
import { PRODUCT_UNITS, type Product } from "@/types/product";
import { useProductMutations, useProductQuery } from "./use-products";
import {
  emptyProductForm,
  productFormSchema,
  type ProductFormValues,
} from "./product-schema";

type ProductFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string | null;
};

function parseQuickCode(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  return Number(trimmed);
}

function toRequest(values: ProductFormValues) {
  return {
    name: values.name.trim(),
    sku: values.sku.trim(),
    size: emptyToNull(values.size),
    description: emptyToNull(values.description),
    imageUrl: emptyToNull(values.imageUrl),
    barcode: emptyToNull(values.barcode),
    quickCode: parseQuickCode(values.quickCode),
    categoryId: values.categoryId,
    price: Number(values.price),
    costPrice: Number(values.costPrice),
    stockQuantity: Number(values.stockQuantity),
    reorderLevel: Number(values.reorderLevel),
    unit: values.unit,
    showOnPos: values.showOnPos,
    hsnCode: emptyToNull(values.hsnCode),
    taxRatePercent: Number(values.taxRatePercent),
  };
}

function fromProduct(product: Product): ProductFormValues {
  return {
    name: product.name ?? "",
    sku: product.sku ?? "",
    size: product.size ?? "",
    description: product.description ?? "",
    imageUrl: product.imageUrl ?? "",
    barcode: product.barcode ?? "",
    quickCode: product.quickCode == null ? "" : String(product.quickCode),
    categoryId: product.categoryId,
    unit: product.unit ?? PRODUCT_UNITS[0],
    price: String(product.price),
    costPrice: String(product.costPrice),
    stockQuantity: String(product.stockQuantity),
    reorderLevel: String(product.reorderLevel),
    showOnPos: product.showOnPos,
    hsnCode: product.hsnCode ?? "",
    taxRatePercent: String(product.taxRatePercent),
    isActive: product.isActive,
  };
}

export function ProductFormDialog({
  open,
  onOpenChange,
  productId,
}: ProductFormDialogProps) {
  const isEdit = Boolean(productId);
  const detailQuery = useProductQuery(open && isEdit ? productId : null);
  const categoriesQuery = useCategoriesQuery({});
  const mutations = useProductMutations();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: emptyProductForm,
  });

  useEffect(() => {
    if (!open) {
      form.reset(emptyProductForm);
      return;
    }
    if (isEdit && detailQuery.data) {
      form.reset(fromProduct(detailQuery.data));
    }
    if (!isEdit) {
      form.reset(emptyProductForm);
    }
  }, [open, isEdit, detailQuery.data, form]);

  const isSubmitting = mutations.create.isPending || mutations.update.isPending;
  const loadedUnit = detailQuery.data?.unit;
  const unitOptions = useMemo(() => {
    if (loadedUnit && !PRODUCT_UNITS.includes(loadedUnit as (typeof PRODUCT_UNITS)[number])) {
      return [loadedUnit, ...PRODUCT_UNITS];
    }
    return [...PRODUCT_UNITS];
  }, [loadedUnit]);

  async function onSubmit(values: ProductFormValues) {
    try {
      if (isEdit && productId) {
        await mutations.update.mutateAsync({
          id: productId,
          body: { ...toRequest(values), isActive: values.isActive },
        });
        toast.success("Product updated successfully.");
        onOpenChange(false);
        return;
      }

      await mutations.create.mutateAsync(toRequest(values));
      toast.success("Product created successfully.");
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
      title={isEdit ? "Edit product" : "Add product"}
      description="Product details are saved to the shop catalog. Inventory movements are not recorded here."
      icon={Package}
      size="lg"
      isDirty={form.formState.isDirty}
      isSubmitting={isSubmitting}
      submitLabel={isEdit ? "Update" : "Create"}
      onSubmit={form.handleSubmit(onSubmit)}
    >
      {isEdit && detailQuery.isLoading ? (
        <LoadingState label="Loading product..." />
      ) : (
        <div className="space-y-6">
          {form.formState.errors.root?.message ? (
            <Alert variant="destructive">
              <AlertDescription>{form.formState.errors.root.message}</AlertDescription>
            </Alert>
          ) : null}

          <section className="space-y-4">
            <h3 className="text-sm font-medium">Basic information</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="Name"
                htmlFor="product-name"
                required
                error={form.formState.errors.name?.message}
              >
                <Input id="product-name" disabled={isSubmitting} {...form.register("name")} />
              </FormField>
              <FormField
                label="SKU"
                htmlFor="product-sku"
                required
                error={form.formState.errors.sku?.message}
              >
                <Input id="product-sku" disabled={isSubmitting} {...form.register("sku")} />
              </FormField>
              <FormField label="Size" htmlFor="product-size">
                <Input id="product-size" disabled={isSubmitting} {...form.register("size")} />
              </FormField>
              <FormField label="Barcode" htmlFor="product-barcode">
                <Input id="product-barcode" disabled={isSubmitting} {...form.register("barcode")} />
              </FormField>
              <FormField
                label="Quick code"
                htmlFor="product-quick-code"
                error={form.formState.errors.quickCode?.message}
              >
                <Input
                  id="product-quick-code"
                  inputMode="numeric"
                  disabled={isSubmitting}
                  {...form.register("quickCode")}
                />
              </FormField>
              <FormField
                label="Description"
                htmlFor="product-description"
                className="sm:col-span-2"
              >
                <Textarea
                  id="product-description"
                  disabled={isSubmitting}
                  {...form.register("description")}
                />
              </FormField>
              <FormField label="Image" className="sm:col-span-2">
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
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-medium">Classification</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="Category"
                required
                error={form.formState.errors.categoryId?.message}
              >
                <Controller
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <Select
                      value={field.value || null}
                      onValueChange={(value) => field.onChange(value ?? "")}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {(categoriesQuery.data ?? []).map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
              <FormField label="Unit" required error={form.formState.errors.unit?.message}>
                <Controller
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <Select
                      value={field.value || null}
                      onValueChange={(value) => field.onChange(value ?? "")}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {unitOptions.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
              <FormField label="HSN code" htmlFor="product-hsn">
                <Input id="product-hsn" disabled={isSubmitting} {...form.register("hsnCode")} />
              </FormField>
              <FormField label="Show on POS">
                <Controller
                  control={form.control}
                  name="showOnPos"
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
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-medium">Pricing</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <FormField
                label="Price"
                htmlFor="product-price"
                required
                error={form.formState.errors.price?.message}
              >
                <Input
                  id="product-price"
                  type="number"
                  step="0.01"
                  disabled={isSubmitting}
                  {...form.register("price")}
                />
              </FormField>
              <FormField
                label="Cost price"
                htmlFor="product-cost"
                required
                error={form.formState.errors.costPrice?.message}
              >
                <Input
                  id="product-cost"
                  type="number"
                  step="0.01"
                  disabled={isSubmitting}
                  {...form.register("costPrice")}
                />
              </FormField>
              <FormField
                label="Tax rate %"
                htmlFor="product-tax"
                required
                error={form.formState.errors.taxRatePercent?.message}
              >
                <Input
                  id="product-tax"
                  type="number"
                  step="0.01"
                  disabled={isSubmitting}
                  {...form.register("taxRatePercent")}
                />
              </FormField>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-medium">Stock levels</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="Stock quantity"
                htmlFor="product-stock"
                required
                error={form.formState.errors.stockQuantity?.message}
              >
                <Input
                  id="product-stock"
                  type="number"
                  disabled={isSubmitting}
                  {...form.register("stockQuantity")}
                />
              </FormField>
              <FormField
                label="Reorder level"
                htmlFor="product-reorder"
                required
                error={form.formState.errors.reorderLevel?.message}
              >
                <Input
                  id="product-reorder"
                  type="number"
                  disabled={isSubmitting}
                  {...form.register("reorderLevel")}
                />
              </FormField>
            </div>
          </section>
        </div>
      )}
    </FormDialog>
  );
}
