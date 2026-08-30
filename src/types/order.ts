export type OrderSummary = {
  id: string;
  billNumber: string | null;
  cashierName: string | null;
  totalAmount: number;
  paymentMethod: string | null;
  orderType: string | null;
  status: string | null;
  itemCount: number;
  createdAt: string;
};

export type OrderListFilters = {
  search?: string;
  fromDate?: string;
  toDate?: string;
  paymentMethod?: string;
  orderType?: string;
  page?: number;
  pageSize?: number;
};
