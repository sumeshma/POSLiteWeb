import type {
  DailyProfitLossBreakdown,
  ExpenseCategoryBreakdown,
  OrderTypeBreakdown,
  PaymentBreakdown,
} from "@/types/report";

export function getPaymentBreakdown(data: unknown): PaymentBreakdown[] {
  if (!data || typeof data !== "object" || !("paymentBreakdown" in data)) {
    return [];
  }
  const value = (data as { paymentBreakdown?: PaymentBreakdown[] | null }).paymentBreakdown;
  return value ?? [];
}

export function getOrderTypeBreakdown(data: unknown): OrderTypeBreakdown[] {
  if (!data || typeof data !== "object" || !("orderTypeBreakdown" in data)) {
    return [];
  }
  const value = (data as { orderTypeBreakdown?: OrderTypeBreakdown[] | null }).orderTypeBreakdown;
  return value ?? [];
}

export function getDailyProfitBreakdown(data: unknown): DailyProfitLossBreakdown[] {
  if (!data || typeof data !== "object" || !("dailyBreakdown" in data)) {
    return [];
  }
  const value = (data as { dailyBreakdown?: DailyProfitLossBreakdown[] | null }).dailyBreakdown;
  return value ?? [];
}

export function getExpenseCategoryBreakdown(data: unknown): ExpenseCategoryBreakdown[] {
  if (!data || typeof data !== "object" || !("expenseBreakdown" in data)) {
    return [];
  }
  const value = (data as { expenseBreakdown?: ExpenseCategoryBreakdown[] | null }).expenseBreakdown;
  return value ?? [];
}
