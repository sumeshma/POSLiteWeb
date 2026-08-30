export const PRODUCT_UNITS = [
  "piece",
  "bottle",
  "glass",
  "liter",
  "ml",
  "kg",
  "g",
  "pack",
] as const;

export type ProductUnit = (typeof PRODUCT_UNITS)[number];

export type Product = {
  id: string;
  name: string | null;
  size: string | null;
  description: string | null;
  imageUrl: string | null;
  sku: string | null;
  barcode: string | null;
  quickCode: number | null;
  categoryId: string;
  categoryName: string | null;
  price: number;
  costPrice: number;
  stockQuantity: number;
  reorderLevel: number;
  unit: string | null;
  isActive: boolean;
  showOnPos: boolean;
  hsnCode: string | null;
  taxRatePercent: number;
  createdAt: string;
  updatedAt: string | null;
};

export type CreateProductRequest = {
  name: string;
  size: string | null;
  description: string | null;
  imageUrl: string | null;
  sku: string;
  barcode: string | null;
  quickCode: number | null;
  categoryId: string;
  price: number;
  costPrice: number;
  stockQuantity: number;
  reorderLevel: number;
  unit: string;
  showOnPos: boolean;
  hsnCode: string | null;
  taxRatePercent: number;
};

export type UpdateProductRequest = CreateProductRequest & {
  isActive: boolean;
};

export type ProductListFilters = {
  search?: string;
  categoryId?: string;
  isActive?: boolean;
  showOnPos?: boolean;
};
