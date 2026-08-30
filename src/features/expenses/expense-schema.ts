import { z } from "zod";
import { toApiDate } from "@/lib/date";

export const expenseFormSchema = z.object({
  title: z.string().trim().min(2, "Title must be at least 2 characters."),
  category: z.string().trim().min(1, "Category is required."),
  amount: z
    .string()
    .trim()
    .refine((value) => Number(value) > 0, "Amount must be greater than zero."),
  expenseDate: z.string().trim().min(1, "Date is required."),
  notes: z.string(),
});

export type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

export function emptyExpenseForm(): ExpenseFormValues {
  return {
    title: "",
    category: "",
    amount: "",
    expenseDate: toApiDate(new Date()),
    notes: "",
  };
}
