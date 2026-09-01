"use client";

import { useEffect } from "react";
import { RequirePermission } from "@/components/auth/require-permission";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { permissions } from "@/config/permissions";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { getErrorMessage } from "@/types/api";
import { PosCartPanel } from "./pos-cart-panel";
import { PosProductGrid } from "./pos-product-grid";
import { PosWorkspaceDialogs } from "./pos-workspace-dialogs";
import { usePosWorkspace } from "./use-pos-workspace";

export function PosMachinePage() {
  const pos = usePosWorkspace();
  const anyDialogOpen =
    pos.checkoutOpen ||
    pos.customerOpen ||
    pos.holdsOpen ||
    pos.clearOpen ||
    Boolean(pos.cancelHold) ||
    Boolean(pos.resumeConfirm) ||
    Boolean(pos.bill);

  useEffect(() => {
    function isEditableTarget(target: EventTarget | null): boolean {
      if (!(target instanceof HTMLElement)) {
        return false;
      }
      const tag = target.tagName;
      return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "F2") {
        event.preventDefault();
        if (!anyDialogOpen) {
          pos.openCheckout();
        }
        return;
      }
      if (event.key === "F4") {
        event.preventDefault();
        if (!anyDialogOpen) {
          void pos.holdCart();
        }
        return;
      }
      if (event.key === "/" && !isEditableTarget(event.target) && !anyDialogOpen) {
        event.preventDefault();
        pos.focusSearch();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [anyDialogOpen, pos]);

  return (
    <RequirePermission permission={permissions.pos}>
      <div className="flex min-h-0 flex-1 flex-col p-3 md:p-4">
        <div className="grid min-h-0 flex-1 overflow-hidden max-md:grid-rows-[minmax(0,1fr)_minmax(22rem,42%)] md:grid-cols-[minmax(0,1fr)_22rem] md:grid-rows-[minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_26rem] xl:grid-cols-[minmax(0,1fr)_30rem] gap-3">
          <section className="flex h-full min-h-0 min-w-0 flex-col gap-3 overflow-hidden">
            <form className="flex gap-2" onSubmit={pos.handleSearchSubmit}>
              <Input
                id="pos-product-search"
                value={pos.search}
                onChange={(event) => pos.setSearch(event.target.value)}
                placeholder="Search or scan barcode"
                autoFocus
                className="h-12 text-base"
                aria-label="Search or scan barcode"
              />
              <Button type="submit" variant="outline" className="h-12 px-4">
                Add
              </Button>
            </form>
            <p className="text-xs text-muted-foreground">
              Press Enter to add a scanned code. F2 opens payment. F4 holds the order. / focuses
              search.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="lg"
                variant={pos.categoryId ? "outline" : "default"}
                onClick={() => pos.setCategoryId("")}
              >
                All
              </Button>
              {pos.categories.map((category) => (
                <Button
                  key={category.id}
                  type="button"
                  size="lg"
                  variant={pos.categoryId === category.id ? "default" : "outline"}
                  onClick={() => pos.setCategoryId(category.id)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
              {pos.productsQuery.isLoading ? (
                <LoadingState label="Loading products..." />
              ) : pos.productsQuery.isError ? (
                <ErrorState
                  title="Unable to load products"
                  description={getErrorMessage(pos.productsQuery.error)}
                  onRetry={() => void pos.productsQuery.refetch()}
                />
              ) : pos.products.length === 0 ? (
                <EmptyState
                  title="No POS products found"
                  description="Try a different search or category. Only active products marked for POS are listed."
                />
              ) : (
                <PosProductGrid
                  density="machine"
                  products={pos.products}
                  allowSellWhenOutOfStock={pos.allowOos}
                  onAdd={(product) => pos.addProduct(product, { focusSearch: true })}
                />
              )}
            </div>
          </section>

          <PosCartPanel
            variant="machine"
            cart={pos.cart}
            gstEnabled={pos.gstEnabled}
            canCheckout={pos.canCheckout}
            holdCount={pos.holdCount}
            submitting={pos.mutations.checkoutSale.isPending || pos.mutations.hold.isPending}
            onIncrement={pos.increment}
            onDecrement={(productId) => pos.dispatch({ type: "decrement", productId })}
            onQuantity={(productId, quantity) =>
              pos.dispatch({ type: "set-quantity", productId, quantity })
            }
            onItemDiscount={(productId, discountAmount) =>
              pos.dispatch({ type: "set-item-discount", productId, discountAmount })
            }
            onRemove={(productId) => pos.dispatch({ type: "remove", productId })}
            onBillDiscount={(discountAmount) =>
              pos.dispatch({ type: "set-bill-discount", discountAmount })
            }
            onPackaging={(packagingCharge) =>
              pos.dispatch({ type: "set-packaging", packagingCharge })
            }
            onOrderType={(orderType) => pos.dispatch({ type: "set-order-type", orderType })}
            onSelectCustomer={() => pos.setCustomerOpen(true)}
            onClearCustomer={() => pos.dispatch({ type: "set-customer", customer: null })}
            onHold={() => void pos.holdCart()}
            onHeldOrders={() => pos.setHoldsOpen(true)}
            onClear={() => pos.setClearOpen(true)}
            onCheckout={pos.openCheckout}
          />
        </div>
        <PosWorkspaceDialogs pos={pos} />
      </div>
    </RequirePermission>
  );
}
