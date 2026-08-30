export type PurchaseItem = {
  productId: string;
  productName: string | null;
  sku: string | null;
  unit: string | null;
  unitCost: number;
  quantity: number;
  lineTotal: number;
};

export type Purchase = {
  id: string;
  purchaseNumber: string | null;
  supplierId: string;
  supplierName: string | null;
  createdBy: string | null;
  subTotal: number;
  totalAmount: number;
  notes: string | null;
  purchaseDate: string;
  items: PurchaseItem[] | null;
};

export type PurchaseItemRequest = {
  productId: string;
  quantity: number;
  unitCost: number;
};

export type CreatePurchaseRequest = {
  supplierId: string;
  notes?: string | null;
  items: PurchaseItemRequest[];
};

export type PurchaseListFilters = {
  search?: string;
  supplierId?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  pageSize?: number;
};
