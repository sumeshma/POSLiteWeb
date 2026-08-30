"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getStockStatus, stockStatusLabel, type StockStatus } from "@/lib/stock-status";

type StockStatusBadgeProps = {
  stockQuantity: number;
  reorderLevel: number;
  isLowStock?: boolean;
  isOutOfStock?: boolean;
};

const badgeClass: Record<StockStatus, string> = {
  in_stock: "border-transparent bg-success/15 text-success",
  low_stock: "border-transparent bg-warning/15 text-warning-foreground",
  out_of_stock: "border-transparent bg-destructive/10 text-destructive",
};

export function StockStatusBadge({
  stockQuantity,
  reorderLevel,
  isLowStock,
  isOutOfStock,
}: StockStatusBadgeProps) {
  const status = getStockStatus({
    stockQuantity,
    reorderLevel,
    isLowStock,
    isOutOfStock,
  });

  return (
    <Badge className={cn(badgeClass[status])}>{stockStatusLabel(status)}</Badge>
  );
}
