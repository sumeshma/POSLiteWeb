"use client";

import Link from "next/link";
import { Monitor } from "lucide-react";
import { RequirePermission } from "@/components/auth/require-permission";
import { PageContainer } from "@/components/layout/page-container";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { permissions } from "@/config/permissions";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { getErrorMessage } from "@/types/api";
import { cn } from "@/lib/utils";
import { PosCartPanel } from "./pos-cart-panel";
import { PosProductGrid } from "./pos-product-grid";
import { PosWorkspaceDialogs } from "./pos-workspace-dialogs";
import { usePosWorkspace } from "./use-pos-workspace";

export function PosPage() {
  const pos = usePosWorkspace();

  return (
    <RequirePermission permission={permissions.pos}>
      <PageContainer fill className="gap-3">
        <div className="flex items-center justify-end">
          <Link
            href="/pos/machine"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            <Monitor />
            POS Machine Mode
          </Link>
        </div>
        <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto lg:grid-cols-[minmax(0,1fr)_24rem] lg:grid-rows-[minmax(0,1fr)] lg:overflow-hidden xl:grid-cols-[minmax(0,1fr)_28rem]">
          <section className="flex h-full min-h-0 min-w-0 flex-col gap-3 overflow-hidden">
            <form className="flex gap-2" onSubmit={pos.handleSearchSubmit}>
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
            </form>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
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
                  products={pos.products}
                  allowSellWhenOutOfStock={pos.allowOos}
                  onAdd={pos.addProduct}
                />
              )}
            </div>
          </section>

          <PosCartPanel
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
      </PageContainer>
    </RequirePermission>
  );
}
