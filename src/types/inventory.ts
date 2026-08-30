export const WRITABLE_MOVEMENT_TYPES = ["StockIn", "StockOut", "Adjustment"] as const;

export const MOVEMENT_TYPES = [
  "StockIn",
  "StockOut",
  "Adjustment",
  "Sale",
  "Purchase",
  "SaleReversal",
] as const;

export type WritableMovementType = (typeof WRITABLE_MOVEMENT_TYPES)[number];
export type MovementType = (typeof MOVEMENT_TYPES)[number];

export type ProductStockSummary = {
  id: string;
  name: string | null;
  sku: string | null;
  unit: string | null;
  stockQuantity: number;
  reorderLevel: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
};

export type StockMovement = {
  id: string;
  productId: string;
  productName: string | null;
  sku: string | null;
  movementType: string | null;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string | null;
  userName: string | null;
  orderId: string | null;
  billNumber: string | null;
  purchaseId: string | null;
  purchaseNumber: string | null;
  createdAt: string;
};

export type InventoryDashboard = {
  totalProducts: number;
  activeProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalStockUnits: number;
  lowStockProducts: ProductStockSummary[] | null;
  recentMovements: StockMovement[] | null;
};

export type LowStockAlertCount = {
  lowStockCount: number;
  outOfStockCount: number;
  totalAlertCount: number;
};

export type CreateStockMovementRequest = {
  movementType: WritableMovementType;
  productId: string;
  quantity: number;
  newQuantity?: number | null;
  reason?: string | null;
};

export type LowStockFilters = {
  search?: string;
  includeOutOfStock?: boolean;
  page: number;
  pageSize: number;
};

export type StockMovementFilters = {
  search?: string;
  productId?: string;
  movementType?: string;
  fromDate?: string;
  toDate?: string;
  page: number;
  pageSize: number;
};
