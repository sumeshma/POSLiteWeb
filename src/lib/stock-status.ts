export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export function getStockStatus(input: {
  stockQuantity: number;
  reorderLevel: number;
  isLowStock?: boolean;
  isOutOfStock?: boolean;
}): StockStatus {
  if (input.isOutOfStock === true || input.stockQuantity <= 0) {
    return "out_of_stock";
  }

  if (input.isLowStock === true) {
    return "low_stock";
  }

  if (input.stockQuantity <= input.reorderLevel) {
    return "low_stock";
  }

  return "in_stock";
}

export function stockStatusLabel(status: StockStatus): string {
  if (status === "out_of_stock") {
    return "Out of stock";
  }
  if (status === "low_stock") {
    return "Low stock";
  }
  return "In stock";
}
