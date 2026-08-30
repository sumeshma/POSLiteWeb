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

export type ReportPeriodKind = "daily" | "monthly" | "yearly";
