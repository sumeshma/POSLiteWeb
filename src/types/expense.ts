export const EXPENSE_CATEGORIES = [
  "Rent",
  "Utilities",
  "Salary",
  "Supplies",
  "Maintenance",
  "Other",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export type Expense = {
  id: string;
  title: string | null;
  category: string | null;
  amount: number;
  expenseDate: string;
  notes: string | null;
  createdByName: string | null;
  createdAt: string;
};

export type CreateExpenseRequest = {
  title: string;
  category: string;
  amount: number;
  expenseDate: string;
  notes?: string | null;
};

export type UpdateExpenseRequest = CreateExpenseRequest;

export type ExpenseListFilters = {
  search?: string;
  category?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  pageSize?: number;
};
