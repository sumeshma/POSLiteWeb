"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { RequirePermission } from "@/components/auth/require-permission";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { FormField } from "@/components/shared/form-field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { permissions } from "@/config/permissions";
import { useProductsQuery } from "@/features/products/use-products";
import { useSuppliersQuery } from "@/features/suppliers/use-suppliers";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { formatCurrency } from "@/lib/currency";
import { emptyToNull } from "@/lib/empty";
import { getMutationErrorMessage, isValidationError } from "@/lib/mutation-errors";
import { cn } from "@/lib/utils";
import { productPosName } from "@/features/pos/cart-state";
import { usePurchaseMutations } from "./use-purchases";

type DraftLine = {
  key: string;
  productId: string;
  name: string;
  sku: string | null;
  unit: string | null;
  quantity: number;
  unitCost: number;
};

function newKey() {
  return crypto.randomUUID();
}

export function PurchaseFormPage() {
  const router = useRouter();
  const mutations = usePurchaseMutations();
  const suppliersQuery = useSuppliersQuery({ isActive: true });
  const [supplierId, setSupplierId] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<DraftLine[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [formError, setFormError] = useState<string | undefined>();
  const debouncedSearch = useDebouncedValue(productSearch);
  const productsQuery = useProductsQuery({
    search: debouncedSearch || undefined,
    isActive: true,
  });
  const products = productsQuery.data ?? [];
  const estimatedTotal = useMemo(
    () => lines.reduce((sum, line) => sum + line.quantity * line.unitCost, 0),
    [lines],
  );

  function addProduct(productId: string) {
    const product = products.find((item) => item.id === productId);
    if (!product) {
      return;
    }
    setLines((current) => {
      const existing = current.find((line) => line.productId === product.id);
      if (existing) {
        return current.map((line) =>
          line.productId === product.id ? { ...line, quantity: line.quantity + 1 } : line,
        );
      }
      return [
        ...current,
        {
          key: newKey(),
          productId: product.id,
          name: productPosName(product),
          sku: product.sku,
          unit: product.unit,
          quantity: 1,
          unitCost: product.costPrice ?? 0,
        },
      ];
    });
    setProductSearch("");
  }

  async function onSubmit() {
    setFormError(undefined);
    if (!supplierId) {
      setFormError("Supplier is required.");
      return;
    }
    if (lines.length === 0) {
      setFormError("Purchase must contain at least one item.");
      return;
    }
    const invalid = lines.find((line) => !Number.isInteger(line.quantity) || line.quantity < 1);
    if (invalid) {
      setFormError("Each item quantity must be a whole number of at least 1.");
      return;
    }
    try {
      await mutations.create.mutateAsync({
        supplierId,
        notes: emptyToNull(notes),
        items: lines.map((line) => ({
          productId: line.productId,
          quantity: line.quantity,
          unitCost: line.unitCost,
        })),
      });
      toast.success("Purchase created successfully");
      router.push("/purchases");
    } catch (error) {
      setFormError(getMutationErrorMessage(error));
      if (!isValidationError(error)) {
        toast.error("Unable to create purchase");
      }
    }
  }

  return (
    <RequirePermission permission={permissions.purchasesManage}>
      <PageContainer>
        <PageHeader
          title="Record purchase"
          description="Select a supplier and add products with quantity and unit cost. The server calculates totals and updates stock."
          actions={
            <Link href="/purchases" className={cn(buttonVariants({ variant: "outline" }))}>
              Back to purchases
            </Link>
          }
        />

        <div className="space-y-6">
            {formError ? (
              <Alert variant="destructive">
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Supplier" htmlFor="purchase-supplier" required>
                <Select value={supplierId || undefined} onValueChange={(value) => setSupplierId(value ?? "")}>
                  <SelectTrigger id="purchase-supplier" className="w-full">
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {(suppliersQuery.data ?? []).map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name || "Supplier"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Notes" htmlFor="purchase-notes">
                <Textarea
                  id="purchase-notes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  disabled={mutations.create.isPending}
                />
              </FormField>
            </div>

            <div className="space-y-3">
              <FormField label="Add product" htmlFor="purchase-product-search">
                <Input
                  id="purchase-product-search"
                  value={productSearch}
                  onChange={(event) => setProductSearch(event.target.value)}
                  placeholder="Search catalog products"
                />
              </FormField>
              <div className="max-h-48 overflow-y-auto rounded-lg border">
                {productsQuery.isLoading ? (
                  <p className="px-3 py-2 text-sm text-muted-foreground">Loading products...</p>
                ) : products.length === 0 ? (
                  <p className="px-3 py-2 text-sm text-muted-foreground">No products found.</p>
                ) : (
                  <ul>
                    {products.slice(0, 40).map((product) => (
                      <li key={product.id} className="flex items-center justify-between gap-2 border-b px-3 py-2 last:border-b-0">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{productPosName(product)}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {product.sku || "No SKU"}
                            {" · Cost "}
                            {formatCurrency(product.costPrice ?? 0)}
                          </p>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => addProduct(product.id)}
                          disabled={mutations.create.isPending}
                        >
                          Add
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {lines.length === 0 ? (
                <EmptyState
                  title="No line items"
                  description="Add at least one product with quantity and unit cost."
                />
              ) : (
                <div className="overflow-x-auto rounded-lg border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40 text-left">
                      <tr>
                        <th className="px-3 py-2 font-medium">Product</th>
                        <th className="px-3 py-2 font-medium">Qty</th>
                        <th className="px-3 py-2 font-medium">Unit cost</th>
                        <th className="px-3 py-2 font-medium">Line</th>
                        <th className="px-3 py-2 font-medium">
                          <span className="sr-only">Remove</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {lines.map((line) => (
                        <tr key={line.key} className="border-t">
                          <td className="px-3 py-2">
                            <p className="font-medium">{line.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {line.sku || "No SKU"}
                              {line.unit ? ` · ${line.unit}` : ""}
                            </p>
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              className="w-24"
                              type="number"
                              min={1}
                              step={1}
                              value={line.quantity}
                              onChange={(event) => {
                                const quantity = Number(event.target.value);
                                setLines((current) =>
                                  current.map((item) =>
                                    item.key === line.key
                                      ? { ...item, quantity: Number.isFinite(quantity) ? quantity : 0 }
                                      : item,
                                  ),
                                );
                              }}
                              aria-label={`Quantity for ${line.name}`}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              className="w-28"
                              type="number"
                              min={0}
                              step="0.01"
                              value={line.unitCost}
                              onChange={(event) => {
                                const unitCost = Number(event.target.value);
                                setLines((current) =>
                                  current.map((item) =>
                                    item.key === line.key
                                      ? { ...item, unitCost: Number.isFinite(unitCost) ? unitCost : 0 }
                                      : item,
                                  ),
                                );
                              }}
                              aria-label={`Unit cost for ${line.name}`}
                            />
                          </td>
                          <td className="px-3 py-2 tabular-nums">
                            {formatCurrency(line.quantity * line.unitCost)}
                          </td>
                          <td className="px-3 py-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Remove ${line.name}`}
                              onClick={() =>
                                setLines((current) => current.filter((item) => item.key !== line.key))
                              }
                            >
                              <Trash2 />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Estimated total {formatCurrency(estimatedTotal)}. Final totals are calculated by the
                server.
              </p>
              <div className="flex gap-2">
                <Link href="/purchases" className={cn(buttonVariants({ variant: "outline" }))}>
                  Cancel
                </Link>
                <Button type="button" onClick={() => void onSubmit()} disabled={mutations.create.isPending}>
                  <Plus />
                  Save purchase
                </Button>
              </div>
            </div>
        </div>
      </PageContainer>
    </RequirePermission>
  );
}
