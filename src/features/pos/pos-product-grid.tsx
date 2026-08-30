"use client";

import { formatCurrency } from "@/lib/currency";
import { formatQuantity } from "@/lib/formatters";
import { resolveMediaUrl } from "@/lib/media";
import { getStockStatus } from "@/lib/stock-status";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";
import { productPosName } from "./cart-state";

type PosProductGridProps = {
  products: Product[];
  allowSellWhenOutOfStock: boolean;
  onAdd: (product: Product) => void;
  density?: "standard" | "machine";
};

export function PosProductGrid({
  products,
  allowSellWhenOutOfStock,
  onAdd,
  density = "standard",
}: PosProductGridProps) {
  const machine = density === "machine";

  return (
    <div
      className={cn(
        "grid gap-2",
        machine
          ? "grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
          : "grid-cols-2 sm:grid-cols-3 xl:grid-cols-4",
      )}
    >
      {products.map((product) => {
        const status = getStockStatus({
          stockQuantity: product.stockQuantity,
          reorderLevel: product.reorderLevel,
        });
        const blocked = status === "out_of_stock" && !allowSellWhenOutOfStock;
        const imageUrl = resolveMediaUrl(product.imageUrl);
        return (
          <button
            key={product.id}
            type="button"
            disabled={blocked}
            onClick={() => onAdd(product)}
            className={cn(
              "flex flex-col items-start text-left transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
              "rounded-xl border border-border bg-card hover:bg-muted/50",
              machine ? "min-h-28 gap-2 p-4" : "gap-1 p-3",
            )}
          >
            {machine && imageUrl ? (
              <span
                className="block h-16 w-full rounded-md bg-muted bg-cover bg-center"
                style={{ backgroundImage: `url("${imageUrl}")` }}
                aria-hidden="true"
              />
            ) : null}
            <p className={cn("line-clamp-2 font-medium", machine && "text-base")}>
              {productPosName(product)}
            </p>
            <p className={cn("font-semibold tabular-nums", machine ? "text-base" : "text-sm")}>
              {formatCurrency(product.price)}
            </p>
            <p className="text-xs text-muted-foreground">
              {product.unit || "unit"}
              {" · "}
              {blocked || status === "out_of_stock"
                ? "Out of stock"
                : `Stock ${formatQuantity(product.stockQuantity)}`}
            </p>
          </button>
        );
      })}
    </div>
  );
}
