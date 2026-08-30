/**
 * Permission keys returned by the POS Lite backend.
 * Do not invent additional names. Source: WEB_DEVELOPER_GUIDE.md §6 and verified login response.
 */
export const permissions = {
  pos: "pos",
  orders: "orders",
  reports: "reports",
  reportsMonthly: "reports.monthly",
  reportsProfit: "reports.profit",
  reportsTax: "reports.tax",
  customers: "customers",
  customersManage: "customers.manage",
  expenses: "expenses",
  expensesManage: "expenses.manage",
  categories: "categories",
  categoriesManage: "categories.manage",
  products: "products",
  productsManage: "products.manage",
  inventory: "inventory",
  inventoryManage: "inventory.manage",
  suppliers: "suppliers",
  suppliersManage: "suppliers.manage",
  purchases: "purchases",
  purchasesManage: "purchases.manage",
  settingsShop: "settings.shop",
  printer: "printer",
  usersManage: "users.manage",
  rolesManage: "roles.manage",
  activityLogs: "activity.logs",
} as const;

export type PermissionKey = (typeof permissions)[keyof typeof permissions];
