"use client";

import { useMemo, useReducer, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { useCategoriesQuery } from "@/features/categories/use-categories";
import { useProductsQuery } from "@/features/products/use-products";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { emptyToNull } from "@/lib/empty";
import { getMutationErrorMessage } from "@/lib/mutation-errors";
import { getStockStatus } from "@/lib/stock-status";
import { listProducts } from "@/services/products.service";
import { getErrorMessage } from "@/types/api";
import type { Bill, CheckoutRequest, HoldOrder } from "@/types/billing";
import type { Product } from "@/types/product";
import { printHtmlDocument } from "@/lib/print";
import { printBillHtml } from "./bill-success-dialog";
import { cartReducer, emptyCart } from "./cart-state";
import { useActiveHoldCountQuery, usePosMutations, useShopSettingsQuery } from "./use-pos";

function findScannedProduct(products: Product[], query: string): Product | undefined {
  const value = query.trim();
  if (!value) {
    return undefined;
  }
  return (
    products.find((product) => product.barcode && product.barcode === value) ||
    products.find((product) => product.sku && product.sku.toLowerCase() === value.toLowerCase()) ||
    products.find((product) => product.quickCode != null && String(product.quickCode) === value)
  );
}

export function usePosWorkspace() {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [cart, dispatch] = useReducer(cartReducer, emptyCart);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | undefined>();
  const [customerOpen, setCustomerOpen] = useState(false);
  const [holdsOpen, setHoldsOpen] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);
  const [cancelHold, setCancelHold] = useState<HoldOrder | null>(null);
  const [resumeConfirm, setResumeConfirm] = useState<HoldOrder | null>(null);
  const [bill, setBill] = useState<Bill | null>(null);
  const debouncedSearch = useDebouncedValue(search);
  const settingsQuery = useShopSettingsQuery();
  const categoriesQuery = useCategoriesQuery({});
  const productsQuery = useProductsQuery({
    search: debouncedSearch || undefined,
    categoryId: categoryId || undefined,
    isActive: true,
    showOnPos: true,
  });
  const holdCountQuery = useActiveHoldCountQuery();
  const mutations = usePosMutations();
  const allowOos = settingsQuery.data?.allowSellWhenOutOfStock ?? false;
  const products = productsQuery.data ?? [];
  const canCheckout =
    cart.lines.length > 0 && (cart.orderType !== "Parcel" || cart.packagingCharge > 0);

  const categories = useMemo(
    () => (categoriesQuery.data ?? []).filter((category) => category.isSellable !== false),
    [categoriesQuery.data],
  );

  function canAdd(product: Product, nextQty: number): boolean {
    if (allowOos) {
      return true;
    }
    const status = getStockStatus({
      stockQuantity: product.stockQuantity,
      reorderLevel: product.reorderLevel,
    });
    if (status === "out_of_stock") {
      toast.error("This product is out of stock.");
      return false;
    }
    if (nextQty > product.stockQuantity) {
      toast.error("Quantity exceeds available stock.");
      return false;
    }
    return true;
  }

  function focusSearch() {
    document.getElementById("pos-product-search")?.focus();
  }

  function addProduct(product: Product, options?: { focusSearch?: boolean }) {
    const existing = cart.lines.find((line) => line.productId === product.id);
    const nextQty = (existing?.quantity ?? 0) + 1;
    if (!canAdd(product, nextQty)) {
      return;
    }
    dispatch({ type: "add", product });
    if (options?.focusSearch) {
      focusSearch();
    }
  }

  async function handleSearchSubmit(event: FormEvent) {
    event.preventDefault();
    const query = search.trim();
    if (!query) {
      return;
    }
    let match = findScannedProduct(products, query);
    if (!match) {
      try {
        const fetched = await listProducts({
          search: query,
          isActive: true,
          showOnPos: true,
        });
        match = findScannedProduct(fetched, query) ?? (fetched.length === 1 ? fetched[0] : undefined);
      } catch (error) {
        toast.error(getErrorMessage(error) || "Unable to look up product");
        return;
      }
    }
    if (!match) {
      toast.error("No matching product found.");
      return;
    }
    addProduct(match, { focusSearch: true });
    setSearch("");
    focusSearch();
  }

  async function submitCheckout(input: {
    paymentMethod: CheckoutRequest["paymentMethod"];
    amountPaid: number;
    paymentReference: string;
    notes: string;
  }) {
    setCheckoutError(undefined);
    const body: CheckoutRequest = {
      items: cart.lines.map((line) => ({
        productId: line.productId,
        quantity: line.quantity,
        discountAmount: line.discountAmount,
      })),
      amountPaid: input.amountPaid,
      paymentMethod: input.paymentMethod,
      paymentReference: emptyToNull(input.paymentReference),
      orderType: cart.orderType,
      packagingCharge: cart.packagingCharge,
      discountAmount: cart.billDiscount,
      notes: emptyToNull(input.notes),
      heldOrderId: cart.heldOrderId || undefined,
      customerId: cart.customer?.id ? cart.customer.id : undefined,
      loyaltyPointsRedeemed: 0,
    };
    try {
      const result = await mutations.checkoutSale.mutateAsync(body);
      toast.success("Sale completed successfully.");
      dispatch({ type: "clear" });
      setCheckoutOpen(false);
      setBill(result);
      focusSearch();
    } catch (error) {
      setCheckoutError(getMutationErrorMessage(error));
      toast.error("Unable to complete sale");
    }
  }

  async function holdCart() {
    if (cart.lines.length === 0) {
      return;
    }
    try {
      await mutations.hold.mutateAsync({
        items: cart.lines.map((line) => ({
          productId: line.productId,
          quantity: line.quantity,
          discountAmount: line.discountAmount,
        })),
        customerName: cart.customer?.name ?? null,
        discountAmount: cart.billDiscount,
      });
      toast.success("Order held successfully.");
      dispatch({ type: "clear" });
    } catch (error) {
      toast.error(getMutationErrorMessage(error) || "Unable to hold order");
    }
  }

  async function resumeHold(hold: HoldOrder) {
    try {
      const resumed = await mutations.resume.mutateAsync(hold.id);
      dispatch({ type: "load-hold", hold: resumed });
      setHoldsOpen(false);
      setResumeConfirm(null);
      toast.success("Held order resumed.");
    } catch (error) {
      toast.error(getMutationErrorMessage(error) || "Unable to resume hold");
    }
  }

  async function confirmCancelHold() {
    if (!cancelHold) {
      return;
    }
    try {
      await mutations.cancel.mutateAsync(cancelHold.id);
      toast.success("Held order cancelled.");
      setCancelHold(null);
    } catch (error) {
      toast.error(getMutationErrorMessage(error) || "Unable to cancel hold");
    }
  }

  function printBill() {
    if (!bill) {
      return;
    }
    const shopName = settingsQuery.data?.appDisplayName || settingsQuery.data?.businessName || "POS Lite";
    try {
      printHtmlDocument(printBillHtml(bill, shopName));
    } catch {
      toast.error("Unable to print the bill.");
      return;
    }
    void mutations.print.mutateAsync(bill.id).catch(() => {
      toast.error("Bill printed, but print count could not be recorded.");
    });
  }

  function openCheckout() {
    if (cart.lines.length === 0) {
      return;
    }
    if (cart.orderType === "Parcel" && cart.packagingCharge <= 0) {
      toast.error("Parcel orders require a packaging charge.");
      return;
    }
    setCheckoutError(undefined);
    setCheckoutOpen(true);
  }

  function increment(productId: string) {
    const line = cart.lines.find((item) => item.productId === productId);
    const product = products.find((item) => item.id === productId);
    if (line && product && !canAdd(product, line.quantity + 1)) {
      return;
    }
    dispatch({ type: "increment", productId });
  }

  return {
    search,
    setSearch,
    handleSearchSubmit,
    focusSearch,
    categoryId,
    setCategoryId,
    categories,
    products,
    productsQuery,
    allowOos,
    settingsQuery,
    cart,
    dispatch,
    addProduct,
    increment,
    canCheckout,
    checkoutOpen,
    setCheckoutOpen,
    checkoutError,
    submitCheckout,
    openCheckout,
    customerOpen,
    setCustomerOpen,
    holdsOpen,
    setHoldsOpen,
    holdCount: holdCountQuery.data ?? 0,
    holdCart,
    resumeHold,
    cancelHold,
    setCancelHold,
    resumeConfirm,
    setResumeConfirm,
    confirmCancelHold,
    clearOpen,
    setClearOpen,
    bill,
    setBill,
    printBill,
    mutations,
    gstEnabled: Boolean(settingsQuery.data?.isGstEnabled),
  };
}

export type PosWorkspace = ReturnType<typeof usePosWorkspace>;
