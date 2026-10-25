"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
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
import { FormField } from "@/components/shared/form-field";
import { useCategoriesQuery } from "@/features/categories/use-categories";
import { productPosName } from "@/features/pos/cart-state";
import { estimateCartTotals } from "@/features/pos/cart-totals";
import { useProductsQuery } from "@/features/products/use-products";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { formatCurrency } from "@/lib/currency";
import { emptyToNull } from "@/lib/empty";
import { createIdempotencyKey, shouldReplaceIdempotencyKey } from "@/lib/idempotency";
import { getMutationErrorMessage, isValidationError } from "@/lib/mutation-errors";
import { cn } from "@/lib/utils";
import { ORDER_TYPES, type OrderType } from "@/types/billing";
import { CreditInvoiceScreen } from "./credit-invoice-screen";
import { creditInvoicePath } from "./credit-invoice-paths";
import { useCreditInvoiceAccess } from "./use-credit-invoice-access";
import { useCreditInvoiceMutations } from "./use-credit-invoices";

type DraftLine = {
  key: string;
  productId: string;
  name: string;
  sku: string | null;
  unitPrice: number;
  quantity: number;
  discountAmount: number;
};

export function CreateCreditInvoicePage() {
  const router = useRouter();
  const mutations = useCreditInvoiceMutations();
  const idempotencyKey = useRef<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [orderType, setOrderType] = useState<OrderType>("Counter");
  const [packagingCharge, setPackagingCharge] = useState(0);
  const [billDiscount, setBillDiscount] = useState(0);
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<DraftLine[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [formError, setFormError] = useState<string | undefined>();
  const debouncedSearch = useDebouncedValue(productSearch);
  const access = useCreditInvoiceAccess();
  const categoriesQuery = useCategoriesQuery({});
  const productsQuery = useProductsQuery(
    {
      search: debouncedSearch || undefined,
      categoryId: categoryId || undefined,
      isActive: true,
      showOnPos: true,
    },
    { enabled: access.canMutate },
  );
  const products = productsQuery.data ?? [];
  const preview = useMemo(
    () =>
      estimateCartTotals(
        lines.map((line) => ({
          productId: line.productId,
          name: line.name,
          sku: line.sku,
          unit: null,
          unitPrice: line.unitPrice,
          quantity: line.quantity,
          discountAmount: line.discountAmount,
          stockQuantity: 0,
        })),
        billDiscount,
        orderType === "Parcel" ? packagingCharge : 0,
      ),
    [billDiscount, lines, orderType, packagingCharge],
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
          key: crypto.randomUUID(),
          productId: product.id,
          name: productPosName(product),
          sku: product.sku,
          unitPrice: product.price,
          quantity: 1,
          discountAmount: 0,
        },
      ];
    });
  }

  async function onSubmit() {
    setFormError(undefined);
    const name = customerName.trim();
    const phone = customerPhone.trim();
    if (!name) {
      setFormError("Customer name is required.");
      return;
    }
    if (name.length > 200) {
      setFormError("Customer name must be 200 characters or less.");
      return;
    }
    if (phone.length > 15) {
      setFormError("Phone must be 15 characters or less.");
      return;
    }
    if (lines.length === 0) {
      setFormError("Add at least one product.");
      return;
    }
    const invalidLine = lines.find(
      (line) =>
        !Number.isInteger(line.quantity) ||
        line.quantity < 1 ||
        line.discountAmount < 0 ||
        line.discountAmount > line.unitPrice * line.quantity,
    );
    if (invalidLine) {
      setFormError("Each line needs a quantity of at least 1 and a discount that does not exceed the line amount.");
      return;
    }
    if (billDiscount < 0 || billDiscount > preview.subTotal) {
      setFormError("Bill discount cannot be negative or greater than the subtotal.");
      return;
    }
    const packaging = orderType === "Parcel" ? packagingCharge : 0;
    if (orderType === "Parcel" && packaging <= 0) {
      setFormError("Parcel invoices need a packaging charge greater than 0.");
      return;
    }

    if (!idempotencyKey.current) {
      idempotencyKey.current = createIdempotencyKey("web-cr");
    }

    try {
      const invoice = await mutations.create.mutateAsync({
        idempotencyKey: idempotencyKey.current,
        customerName: name,
        customerPhone: emptyToNull(phone),
        customerId: null,
        orderType,
        packagingCharge: packaging,
        discountAmount: billDiscount,
        notes: emptyToNull(notes),
        items: lines.map((line) => ({
          productId: line.productId,
          quantity: line.quantity,
          discountAmount: line.discountAmount,
        })),
      });
      idempotencyKey.current = null;
      toast.success(invoice.invoiceNumber ? `Created ${invoice.invoiceNumber}` : "Credit invoice created");
      if (invoice.invoiceNumber) {
        router.push(creditInvoicePath(invoice.invoiceNumber));
      }
    } catch (error) {
      if (shouldReplaceIdempotencyKey(error)) {
        idempotencyKey.current = null;
      }
      setFormError(getMutationErrorMessage(error));
      if (!isValidationError(error)) {
        toast.error("Unable to create credit invoice");
      }
    }
  }

  return (
    <CreditInvoiceScreen mode="mutate">
      <PageHeader
        title="New credit invoice"
        description="No payment is taken now. The full total stays outstanding, and stock is deducted when the invoice is created."
        actions={
          <Link href="/credit-invoices" className={cn(buttonVariants({ variant: "outline" }))}>
            Back
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
          <FormField label="Customer name" htmlFor="credit-customer-name" required>
            <Input
              id="credit-customer-name"
              value={customerName}
              maxLength={200}
              onChange={(event) => setCustomerName(event.target.value)}
              disabled={mutations.create.isPending}
            />
          </FormField>
          <FormField label="Phone" htmlFor="credit-customer-phone" description="Optional. Up to 15 characters.">
            <Input
              id="credit-customer-phone"
              value={customerPhone}
              maxLength={15}
              onChange={(event) => setCustomerPhone(event.target.value)}
              disabled={mutations.create.isPending}
            />
          </FormField>
          <FormField label="Order type">
            <Select
              value={orderType}
              onValueChange={(value) => {
                if (value === "Counter" || value === "Parcel") {
                  setOrderType(value);
                }
              }}
              disabled={mutations.create.isPending}
            >
              <SelectTrigger className="w-full" aria-label="Order type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ORDER_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField
            label="Packaging charge"
            htmlFor="credit-packaging"
            description={orderType === "Counter" ? "Counter invoices send packaging as 0." : "Required for parcel."}
          >
            <Input
              id="credit-packaging"
              type="number"
              min={0}
              step="0.01"
              value={orderType === "Counter" ? 0 : packagingCharge}
              disabled={mutations.create.isPending || orderType === "Counter"}
              onChange={(event) => setPackagingCharge(Number(event.target.value))}
            />
          </FormField>
          <FormField label="Bill discount" htmlFor="credit-discount">
            <Input
              id="credit-discount"
              type="number"
              min={0}
              step="0.01"
              value={billDiscount}
              disabled={mutations.create.isPending}
              onChange={(event) => setBillDiscount(Number(event.target.value))}
            />
          </FormField>
          <FormField label="Notes" htmlFor="credit-notes">
            <Textarea
              id="credit-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              disabled={mutations.create.isPending}
            />
          </FormField>
        </div>

        <div className="space-y-3">
          <div className="grid gap-3 md:grid-cols-[12rem_minmax(0,1fr)]">
            <FormField label="Category">
              <Select
                value={categoryId || "all"}
                onValueChange={(value) => setCategoryId(!value || value === "all" ? "" : value)}
              >
                <SelectTrigger className="w-full" aria-label="Category">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {(categoriesQuery.data ?? [])
                    .filter((category) => category.isActive)
                    .map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name || "Category"}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Add product" htmlFor="credit-product-search">
              <Input
                id="credit-product-search"
                value={productSearch}
                onChange={(event) => setProductSearch(event.target.value)}
                placeholder="Search name, SKU, or barcode"
              />
            </FormField>
          </div>
          <div className="max-h-56 overflow-y-auto rounded-lg border">
            {productsQuery.isLoading ? (
              <p className="px-3 py-2 text-sm text-muted-foreground">Loading products...</p>
            ) : products.length === 0 ? (
              <p className="px-3 py-2 text-sm text-muted-foreground">No products found.</p>
            ) : (
              <ul>
                {products.slice(0, 40).map((product) => (
                  <li
                    key={product.id}
                    className="flex items-center justify-between gap-2 border-b px-3 py-2 last:border-b-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{productPosName(product)}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {product.sku || "No SKU"}
                        {" · "}
                        {formatCurrency(product.price)}
                        {" · Stock "}
                        {product.stockQuantity}
                      </p>
                    </div>
                    <Button type="button" size="sm" variant="outline" onClick={() => addProduct(product.id)}>
                      Add
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {lines.length === 0 ? (
          <p className="text-sm text-muted-foreground">No lines yet.</p>
        ) : (
          <ul className="divide-y rounded-lg border">
            {lines.map((line) => (
              <li key={line.key} className="grid gap-3 p-3 md:grid-cols-[minmax(0,1fr)_6rem_8rem_auto]">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{line.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {line.sku || "No SKU"} · {formatCurrency(line.unitPrice)}
                  </p>
                </div>
                <Input
                  type="number"
                  min={1}
                  step={1}
                  aria-label={`Quantity for ${line.name}`}
                  value={line.quantity}
                  disabled={mutations.create.isPending}
                  onChange={(event) => {
                    const quantity = Number(event.target.value);
                    setLines((current) =>
                      current.map((item) => (item.key === line.key ? { ...item, quantity } : item)),
                    );
                  }}
                />
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  aria-label={`Discount for ${line.name}`}
                  value={line.discountAmount}
                  disabled={mutations.create.isPending}
                  onChange={(event) => {
                    const discountAmount = Number(event.target.value);
                    setLines((current) =>
                      current.map((item) =>
                        item.key === line.key ? { ...item, discountAmount } : item,
                      ),
                    );
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={mutations.create.isPending}
                  onClick={() => setLines((current) => current.filter((item) => item.key !== line.key))}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Estimated total {formatCurrency(preview.totalAmount)}. Tax is calculated when the invoice is created.
          </p>
          <Button type="button" onClick={() => void onSubmit()} disabled={mutations.create.isPending}>
            {mutations.create.isPending ? "Creating..." : "Create invoice"}
          </Button>
        </div>
      </div>
    </CreditInvoiceScreen>
  );
}
