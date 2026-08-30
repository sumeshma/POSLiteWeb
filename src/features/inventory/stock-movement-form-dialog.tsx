"use client";

import { useEffect, useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Warehouse } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { FormDialog } from "@/components/shared/form-dialog";
import { FormField } from "@/components/shared/form-field";
import { LoadingState } from "@/components/shared/loading-state";
import { useProductQuery, useProductsQuery } from "@/features/products/use-products";
import { emptyToNull } from "@/lib/empty";
import { formatQuantity } from "@/lib/formatters";
import { getMutationErrorMessage, isValidationError } from "@/lib/mutation-errors";
import type { CreateStockMovementRequest, WritableMovementType } from "@/types/inventory";
import { useCreateStockMovement } from "./use-inventory";
import {
  emptyStockMovementForm,
  stockMovementFormSchema,
  type StockMovementFormValues,
} from "./movement-schema";

type StockMovementFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId?: string | null;
};

function movementLabel(type: WritableMovementType): string {
  if (type === "StockIn") {
    return "Stock in";
  }
  if (type === "StockOut") {
    return "Stock out";
  }
  return "Adjustment";
}

export function StockMovementFormDialog({
  open,
  onOpenChange,
  productId,
}: StockMovementFormDialogProps) {
  const productsQuery = useProductsQuery({ isActive: true }, { enabled: open });
  const mutation = useCreateStockMovement();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, setPending] = useState<CreateStockMovementRequest | null>(null);

  const form = useForm<StockMovementFormValues>({
    resolver: zodResolver(stockMovementFormSchema),
    defaultValues: emptyStockMovementForm,
  });

  useEffect(() => {
    if (!open) {
      form.reset(emptyStockMovementForm);
      return;
    }
    form.reset({
      ...emptyStockMovementForm,
      productId: productId ?? "",
    });
  }, [open, productId, form]);

  const selectedProductId = useWatch({ control: form.control, name: "productId" });
  const movementType = useWatch({ control: form.control, name: "movementType" });
  const productQuery = useProductQuery(open && selectedProductId ? selectedProductId : null);
  const currentStock = productQuery.data?.stockQuantity;
  const selectedProduct = useMemo(
    () => (productsQuery.data ?? []).find((item) => item.id === selectedProductId),
    [productsQuery.data, selectedProductId],
  );

  function onValid(values: StockMovementFormValues) {
    const body: CreateStockMovementRequest =
      values.movementType === "Adjustment"
        ? {
            movementType: "Adjustment",
            productId: values.productId,
            quantity: 0,
            newQuantity: Number(values.newQuantity),
            reason: emptyToNull(values.reason),
          }
        : {
            movementType: values.movementType,
            productId: values.productId,
            quantity: Number(values.quantity),
            reason: emptyToNull(values.reason),
          };
    setPending(body);
    setConfirmOpen(true);
  }

  function handleFormOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setConfirmOpen(false);
      setPending(null);
    }
    onOpenChange(nextOpen);
  }

  async function confirmApply() {
    if (!pending) {
      return;
    }
    try {
      await mutation.mutateAsync(pending);
      toast.success("Stock adjusted successfully.");
      setConfirmOpen(false);
      setPending(null);
      onOpenChange(false);
    } catch (error) {
      setConfirmOpen(false);
      form.setError("root", { message: getMutationErrorMessage(error) });
      if (!isValidationError(error)) {
        toast.error("Unable to update stock");
      }
    }
  }

  const confirmDescription = (() => {
    const name = selectedProduct
      ? [selectedProduct.name, selectedProduct.size].filter(Boolean).join(" — ")
      : "this product";
    if (!pending) {
      return "";
    }
    if (pending.movementType === "Adjustment") {
      return `Set stock of ${name} to ${formatQuantity(pending.newQuantity ?? 0)}.`;
    }
    if (pending.movementType === "StockIn") {
      return `Add ${formatQuantity(pending.quantity)} to ${name}.`;
    }
    return `Remove ${formatQuantity(pending.quantity)} from ${name}.`;
  })();

  return (
    <>
      <FormDialog
        open={open}
        onOpenChange={handleFormOpenChange}
        title="Record stock movement"
        description="Stock in, stock out, and adjustments are recorded by the backend. Sale and purchase movements cannot be created here."
        icon={Warehouse}
        size="md"
        isDirty={form.formState.isDirty}
        isSubmitting={mutation.isPending}
        submitLabel="Review"
        onSubmit={form.handleSubmit(onValid)}
      >
        {form.formState.errors.root?.message ? (
          <Alert variant="destructive">
            <AlertDescription>{form.formState.errors.root.message}</AlertDescription>
          </Alert>
        ) : null}

        <FormField
          label="Product"
          required
          error={form.formState.errors.productId?.message}
        >
          <Controller
            control={form.control}
            name="productId"
            render={({ field }) => (
              <Select
                value={field.value || null}
                onValueChange={(value) => field.onChange(value ?? "")}
                disabled={mutation.isPending || Boolean(productId)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {(productsQuery.data ?? []).map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {[product.name, product.size].filter(Boolean).join(" — ")}
                      {product.sku ? ` (${product.sku})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>

        {selectedProductId ? (
          productQuery.isLoading ? (
            <LoadingState label="Loading current stock..." />
          ) : (
            <p className="text-sm text-muted-foreground">
              Current stock:{" "}
              <span className="font-medium text-foreground">
                {currentStock == null ? "—" : formatQuantity(currentStock)}
                {productQuery.data?.unit ? ` ${productQuery.data.unit}` : ""}
              </span>
            </p>
          )
        ) : null}

        <FormField
          label="Movement type"
          required
          error={form.formState.errors.movementType?.message}
        >
          <Controller
            control={form.control}
            name="movementType"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(value) => field.onChange(value ?? "StockIn")}
                disabled={mutation.isPending}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="StockIn">{movementLabel("StockIn")}</SelectItem>
                  <SelectItem value="StockOut">{movementLabel("StockOut")}</SelectItem>
                  <SelectItem value="Adjustment">{movementLabel("Adjustment")}</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </FormField>

        {movementType === "Adjustment" ? (
          <FormField
            label="New quantity"
            htmlFor="movement-new-qty"
            required
            description="Adjustment sets the product to this absolute quantity."
            error={form.formState.errors.newQuantity?.message}
          >
            <Input
              id="movement-new-qty"
              type="number"
              min={0}
              disabled={mutation.isPending}
              {...form.register("newQuantity")}
            />
          </FormField>
        ) : (
          <FormField
            label="Quantity"
            htmlFor="movement-qty"
            required
            error={form.formState.errors.quantity?.message}
          >
            <Input
              id="movement-qty"
              type="number"
              min={1}
              disabled={mutation.isPending}
              {...form.register("quantity")}
            />
          </FormField>
        )}

        <FormField label="Reason" htmlFor="movement-reason">
          <Textarea
            id="movement-reason"
            disabled={mutation.isPending}
            {...form.register("reason")}
          />
        </FormField>
      </FormDialog>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Apply this stock change?"
        description={confirmDescription}
        confirmLabel="Apply"
        destructive={pending?.movementType === "StockOut"}
        loading={mutation.isPending}
        onConfirm={() => void confirmApply()}
      />
    </>
  );
}
