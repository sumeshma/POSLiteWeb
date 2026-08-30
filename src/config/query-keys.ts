/**
 * Query key convention for POS Lite Web.
 *
 * Use a factory per domain so keys stay consistent and easy to invalidate:
 *
 *   queryKeys.products.all()
 *   queryKeys.products.list(filters)
 *   queryKeys.products.detail(id)
 *
 * Pattern:
 *   {domain}.all()                         → ["products"]
 *   {domain}.lists()                       → ["products", "list"]
 *   {domain}.list(filters)                 → ["products", "list", filters]
 *   {domain}.details()                     → ["products", "detail"]
 *   {domain}.detail(id)                    → ["products", "detail", id]
 *
 * Feature query factories belong with their modules. This file only holds
 * shared/foundation keys until those modules exist.
 */
export const queryKeys = {
  health: () => ["health"] as const,
  auth: {
    all: () => ["auth"] as const,
    session: () => [...queryKeys.auth.all(), "session"] as const,
    me: () => [...queryKeys.auth.all(), "me"] as const,
  },
  shop: {
    branding: (shopCode: string) => ["shop", "branding", shopCode] as const,
  },
  categories: {
    all: () => ["categories"] as const,
    lists: () => [...queryKeys.categories.all(), "list"] as const,
    list: (filters: unknown) => [...queryKeys.categories.lists(), filters] as const,
    details: () => [...queryKeys.categories.all(), "detail"] as const,
    detail: (id: string) => [...queryKeys.categories.details(), id] as const,
  },
  products: {
    all: () => ["products"] as const,
    lists: () => [...queryKeys.products.all(), "list"] as const,
    list: (filters: unknown) => [...queryKeys.products.lists(), filters] as const,
    details: () => [...queryKeys.products.all(), "detail"] as const,
    detail: (id: string) => [...queryKeys.products.details(), id] as const,
  },
  customers: {
    all: () => ["customers"] as const,
    lists: () => [...queryKeys.customers.all(), "list"] as const,
    list: (filters: unknown) => [...queryKeys.customers.lists(), filters] as const,
    details: () => [...queryKeys.customers.all(), "detail"] as const,
    detail: (id: string) => [...queryKeys.customers.details(), id] as const,
  },
  suppliers: {
    all: () => ["suppliers"] as const,
    lists: () => [...queryKeys.suppliers.all(), "list"] as const,
    list: (filters: unknown) => [...queryKeys.suppliers.lists(), filters] as const,
    details: () => [...queryKeys.suppliers.all(), "detail"] as const,
    detail: (id: string) => [...queryKeys.suppliers.details(), id] as const,
  },
  inventory: {
    all: () => ["inventory"] as const,
    dashboard: () => [...queryKeys.inventory.all(), "dashboard"] as const,
    lowStockCount: () => [...queryKeys.inventory.all(), "low-stock-count"] as const,
    lowStock: (filters: unknown) =>
      [...queryKeys.inventory.all(), "low-stock", filters] as const,
    movements: (filters: unknown) =>
      [...queryKeys.inventory.all(), "movements", filters] as const,
  },
  billing: {
    all: () => ["billing"] as const,
    detail: (id: string) => [...queryKeys.billing.all(), "detail", id] as const,
  },
  holds: {
    all: () => ["holds"] as const,
    list: (search?: string) => [...queryKeys.holds.all(), "list", search ?? ""] as const,
    activeCount: () => [...queryKeys.holds.all(), "active-count"] as const,
  },
  shopSettings: {
    all: () => ["shop-settings"] as const,
    current: () => [...queryKeys.shopSettings.all(), "current"] as const,
  },
  purchases: {
    all: () => ["purchases"] as const,
    lists: () => [...queryKeys.purchases.all(), "list"] as const,
    list: (filters: unknown) => [...queryKeys.purchases.lists(), filters] as const,
    details: () => [...queryKeys.purchases.all(), "detail"] as const,
    detail: (id: string) => [...queryKeys.purchases.details(), id] as const,
  },
  expenses: {
    all: () => ["expenses"] as const,
    lists: () => [...queryKeys.expenses.all(), "list"] as const,
    list: (filters: unknown) => [...queryKeys.expenses.lists(), filters] as const,
    details: () => [...queryKeys.expenses.all(), "detail"] as const,
    detail: (id: string) => [...queryKeys.expenses.details(), id] as const,
    categories: () => [...queryKeys.expenses.all(), "categories"] as const,
    deleted: () => [...queryKeys.expenses.all(), "deleted"] as const,
  },
  reports: {
    all: () => ["reports"] as const,
    dailySales: (date?: string) => [...queryKeys.reports.all(), "daily-sales", date ?? ""] as const,
    monthlySales: (year?: number, month?: number) =>
      [...queryKeys.reports.all(), "monthly-sales", year ?? 0, month ?? 0] as const,
    yearlySales: (year?: number) => [...queryKeys.reports.all(), "yearly-sales", year ?? 0] as const,
    dailyProfit: (date?: string) => [...queryKeys.reports.all(), "daily-pl", date ?? ""] as const,
    monthlyProfit: (year?: number, month?: number) =>
      [...queryKeys.reports.all(), "monthly-pl", year ?? 0, month ?? 0] as const,
    yearlyProfit: (year?: number) => [...queryKeys.reports.all(), "yearly-pl", year ?? 0] as const,
    gst: (fromDate: string, toDate: string) =>
      [...queryKeys.reports.all(), "gst", fromDate, toDate] as const,
  },
  orders: {
    all: () => ["orders"] as const,
    lists: () => [...queryKeys.orders.all(), "list"] as const,
    list: (filters: unknown) => [...queryKeys.orders.lists(), filters] as const,
  },
  users: {
    all: () => ["users"] as const,
    lists: () => [...queryKeys.users.all(), "list"] as const,
    list: () => [...queryKeys.users.lists(), "active"] as const,
    deleted: () => [...queryKeys.users.all(), "deleted"] as const,
    details: () => [...queryKeys.users.all(), "detail"] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
    me: () => [...queryKeys.users.all(), "me"] as const,
    permissions: () => [...queryKeys.users.all(), "permissions"] as const,
  },
  roles: {
    all: () => ["roles"] as const,
    list: () => [...queryKeys.roles.all(), "list"] as const,
    deleted: () => [...queryKeys.roles.all(), "deleted"] as const,
    details: () => [...queryKeys.roles.all(), "detail"] as const,
    detail: (id: string) => [...queryKeys.roles.details(), id] as const,
  },
  activityLogs: {
    all: () => ["activity-logs"] as const,
    list: (filters: unknown) => [...queryKeys.activityLogs.all(), "list", filters] as const,
  },
  attendance: {
    all: () => ["attendance"] as const,
    list: (filters: unknown) => [...queryKeys.attendance.all(), "list", filters] as const,
    dashboard: () => [...queryKeys.attendance.all(), "dashboard"] as const,
  },
};
