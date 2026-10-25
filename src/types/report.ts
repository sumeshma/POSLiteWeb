export type PaymentBreakdown = {
  paymentMethod: string | null;
  orderCount: number;
  totalAmount: number;
};

export type OrderTypeBreakdown = {
  orderType: string | null;
  orderCount: number;
  totalAmount: number;
};

export type HourlySalesBreakdown = {
  hour: number;
  orderCount: number;
  totalSales: number;
};

export type DailySalesBreakdown = {
  date: string;
  orderCount: number;
  totalSales: number;
};

export type MonthlySalesBreakdown = {
  month: number;
  orderCount: number;
  totalSales: number;
};

export type DailySalesReport = {
  date: string;
  totalOrders: number;
  totalSales: number;
  averageOrderValue: number;
  paymentBreakdown: PaymentBreakdown[] | null;
  orderTypeBreakdown: OrderTypeBreakdown[] | null;
  hourlyBreakdown: HourlySalesBreakdown[] | null;
};

export type MonthlySalesReport = {
  year: number;
  month: number;
  totalOrders: number;
  totalSales: number;
  averageOrderValue: number;
  paymentBreakdown: PaymentBreakdown[] | null;
  orderTypeBreakdown: OrderTypeBreakdown[] | null;
  dailyBreakdown: DailySalesBreakdown[] | null;
};

export type YearlySalesReport = {
  year: number;
  totalOrders: number;
  totalSales: number;
  averageOrderValue: number;
  monthlyBreakdown: MonthlySalesBreakdown[] | null;
};

export type ExpenseCategoryBreakdown = {
  category: string | null;
  totalAmount: number;
  count: number;
};

export type DailyProfitLossBreakdown = {
  date: string;
  revenue: number;
  netProfit: number;
};

export type DailyProfitLossReport = {
  date: string;
  revenue: number;
  costOfGoodsSold: number;
  grossProfit: number;
  purchases: number;
  expenses: number;
  netProfit: number;
  orderCount: number;
  expenseBreakdown: ExpenseCategoryBreakdown[] | null;
};

export type MonthlyProfitLossReport = {
  year: number;
  month: number;
  revenue: number;
  costOfGoodsSold: number;
  grossProfit: number;
  purchases: number;
  expenses: number;
  netProfit: number;
  orderCount: number;
  expenseBreakdown: ExpenseCategoryBreakdown[] | null;
  dailyBreakdown: DailyProfitLossBreakdown[] | null;
};

export type YearlyProfitLossReport = {
  year: number;
  revenue: number;
  costOfGoodsSold: number;
  grossProfit: number;
  purchases: number;
  expenses: number;
  netProfit: number;
  orderCount: number;
};

export type GstRateBreakdown = {
  taxRatePercent: number;
  taxableAmount: number;
  taxAmount: number;
  cgstAmount: number;
  sgstAmount: number;
};

export type GstReport = {
  fromDate: string;
  toDate: string;
  totalTaxableAmount: number;
  totalTaxAmount: number;
  totalCgst: number;
  totalSgst: number;
  orderCount: number;
  rateBreakdown: GstRateBreakdown[] | null;
};

export type ProductSalesSort = "revenue" | "quantity" | "name";

export const PRODUCT_SALES_SORTS: { id: ProductSalesSort; label: string }[] = [
  { id: "revenue", label: "Revenue" },
  { id: "quantity", label: "Quantity" },
  { id: "name", label: "Name" },
];

export type ProductSalesItem = {
  productId: string;
  productName: string | null;
  sku: string | null;
  size: string | null;
  categoryName: string | null;
  unit: string | null;
  quantitySold: number;
  orderCount: number;
  revenue: number;
  discountAmount: number;
  taxAmount: number;
  costOfGoodsSold: number;
  grossProfit: number;
};

export type ProductSalesDailyPoint = {
  date: string;
  quantitySold: number;
  revenue: number;
};

export type ProductSalesBillLine = {
  orderId: string;
  billNumber: string | null;
  soldAt: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  discountAmount: number;
};

export type ProductSalesReport = {
  fromDate: string;
  toDate: string;
  totalProducts: number;
  totalQuantitySold: number;
  totalRevenue: number;
  items: ProductSalesItem[] | null;
  selectedProductId: string | null;
  dailyBreakdown: ProductSalesDailyPoint[] | null;
  billLines: ProductSalesBillLine[] | null;
  billLineTotalCount: number;
  billLinePage: number;
  billLinePageSize: number;
};

export type ProductSalesParams = {
  fromDate: string;
  toDate: string;
  sortBy?: ProductSalesSort;
  limit?: number;
  search?: string;
  productId?: string;
  billLinePage?: number;
  billLinePageSize?: number;
};

export type ReportPeriodKind = "daily" | "monthly" | "yearly";
