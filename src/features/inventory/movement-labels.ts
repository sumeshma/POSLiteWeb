import { MOVEMENT_TYPES, type MovementType } from "@/types/inventory";

const LABELS: Record<MovementType, string> = {
  StockIn: "Stock in",
  StockOut: "Stock out",
  Adjustment: "Adjustment",
  Sale: "Sale",
  Purchase: "Purchase",
  SaleReversal: "Sale reversal",
};

export function formatMovementType(value: string | null | undefined): string {
  if (!value) {
    return "—";
  }
  if (value in LABELS) {
    return LABELS[value as MovementType];
  }
  return value;
}

export function formatMovementReference(input: {
  reason: string | null;
  billNumber: string | null;
  purchaseNumber: string | null;
}): string {
  return input.reason || input.billNumber || input.purchaseNumber || "—";
}

export { MOVEMENT_TYPES };
