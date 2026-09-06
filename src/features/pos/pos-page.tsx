"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Monitor, ShoppingBag } from "lucide-react";
import { RequirePermission } from "@/components/auth/require-permission";
import { PageContainer } from "@/components/layout/page-container";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { permissions } from "@/config/permissions";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { getErrorMessage } from "@/types/api";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { estimateCartTotals } from "./cart-totals";
import { PosCartPanel } from "./pos-cart-panel";
import { PosProductGrid } from "./pos-product-grid";
import { PosWorkspaceDialogs } from "./pos-workspace-dialogs";
import { usePosWorkspace } from "./use-pos-workspace";

export function PosPage() {
  const pos = usePosWorkspace();
  const [cartOpen, setCartOpen] = useState(false);
  const totals = estimateCartTotals(pos.cart.lines, pos.cart.billDiscount, pos.cart.packagingCharge);
  const quantity = pos.cart.lines.reduce((sum, line) => sum + line.quantity, 0);
  const quantityLabel = quantity === 1 ? "1 item" : `${quantity} items`;

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    function closeOnDesktop() {
      if (media.matches) {
        setCartOpen(false);
      }
    }
    closeOnDesktop();
    media.addEventListener("change", closeOnDesktop);
    return () => media.removeEventListener("change", closeOnDesktop);
  }, []);

  function renderCartPanel(mobile: boolean) {
    return (
      <PosCartPanel
        cart={pos.cart}
        gstEnabled={pos.gstEnabled}
        canCheckout={pos.canCheckout}
        holdCount={pos.holdCount}
        submitting={pos.mutations.checkoutSale.isPending || pos.mutations.hold.isPending}
        className={
          mobile ? "h-full min-h-0 rounded-none border-0" : "h-full min-h-0"
        }
        onIncrement={pos.increment}
        onDecrement={(productId) => pos.dispatch({ type: "decrement", productId })}
        onQuantity={(productId, nextQuantity) =>
          pos.dispatch({ type: "set-quantity", productId, quantity: nextQuantity })
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
        onSelectCustomer={() => {
          setCartOpen(false);
          pos.setCustomerOpen(true);
        }}
        onClearCustomer={() => pos.dispatch({ type: "set-customer", customer: null })}
        onHold={() => void pos.holdCart()}
        onHeldOrders={() => {
          setCartOpen(false);
          pos.setHoldsOpen(true);
        }}
        onClear={() => {
          setCartOpen(false);
          pos.setClearOpen(true);
        }}
        onCheckout={() => {
          setCartOpen(false);
          pos.openCheckout();
        }}
      />
    );
  }

  return (
    <RequirePermission permission={permissions.pos}>
      <PageContainer fill className="relative gap-2 overflow-hidden p-3 md:gap-3 md:p-6">
        <div className="grid h-full min-h-0 flex-1 grid-rows-[minmax(0,1fr)] gap-3 overflow-hidden lg:grid-cols-[minmax(0,1fr)_24rem] xl:grid-cols-[minmax(0,1fr)_28rem]">
          <section className="flex min-h-0 min-w-0 flex-col gap-2 overflow-hidden md:gap-3">
            <form className="flex shrink-0 gap-2" onSubmit={pos.handleSearchSubmit}>
              <Input
                id="pos-product-search"
                value={pos.search}
                onChange={(event) => pos.setSearch(event.target.value)}
                placeholder="Search or scan barcode"
                autoFocus
                aria-label="Search or scan barcode"
              />
              <Button type="submit" variant="outline">
                Add
              </Button>
              <Link
                href="/pos/machine"
                className={cn(buttonVariants({ variant: "outline", size: "icon" }), "shrink-0")}
                aria-label="POS Machine Mode"
                title="POS Machine Mode"
              >
                <Monitor />
              </Link>
            </form>
            <div className="-mx-1 flex shrink-0 gap-2 overflow-x-auto px-1 pb-0.5">
              <Button
                type="button"
                size="sm"
                className="shrink-0"
                variant={pos.categoryId ? "outline" : "default"}
                onClick={() => pos.setCategoryId("")}
              >
                All
              </Button>
              {pos.categories.map((category) => (
                <Button
                  key={category.id}
                  type="button"
                  size="sm"
                  className="shrink-0"
                  variant={pos.categoryId === category.id ? "default" : "outline"}
                  onClick={() => pos.setCategoryId(category.id)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-20 pr-1 lg:pb-0">
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
                  products={pos.products}
                  allowSellWhenOutOfStock={pos.allowOos}
                  onAdd={pos.addProduct}
                />
              )}
            </div>
          </section>

          <div className="hidden min-h-0 min-w-0 lg:flex lg:h-full lg:flex-col">
            {renderCartPanel(false)}
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 p-3 lg:hidden">
          <Button
            type="button"
            className="pointer-events-auto h-12 w-full justify-between shadow-lg"
            onClick={() => setCartOpen(true)}
          >
            <span className="inline-flex items-center gap-2">
              <ShoppingBag className="size-4" aria-hidden />
              View cart
            </span>
            <span className="tabular-nums">
              {quantityLabel} · {formatCurrency(totals.totalAmount)}
            </span>
          </Button>
        </div>

        <Sheet open={cartOpen} onOpenChange={setCartOpen}>
          <SheetContent
            side="bottom"
            showCloseButton
            className="flex w-full flex-col gap-0 overflow-hidden rounded-t-2xl p-0 pt-10 data-[side=bottom]:h-[90dvh] data-[side=bottom]:max-h-[90dvh]"
          >
            <SheetTitle className="sr-only">Cart</SheetTitle>
            {renderCartPanel(true)}
          </SheetContent>
        </Sheet>

        <PosWorkspaceDialogs pos={pos} />
      </PageContainer>
    </RequirePermission>
  );
}
