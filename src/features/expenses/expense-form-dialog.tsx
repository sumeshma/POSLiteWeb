"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Wallet } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormDialog } from "@/components/shared/form-dialog";
import { FormField } from "@/components/shared/form-field";
import { LoadingState } from "@/components/shared/loading-state";
import { emptyToNull } from "@/lib/empty";
import { getMutationErrorMessage, isValidationError } from "@/lib/mutation-errors";
import type { Expense } from "@/types/expense";
import { emptyExpenseForm, expenseFormSchema, type ExpenseFormValues } from "./expense-schema";
import { useExpenseCategoriesQuery, useExpenseMutations, useExpenseQuery } from "./use-expenses";

type ExpenseFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expenseId: string | null;
};

function toRequest(values: ExpenseFormValues) {
  return {
    title: values.title.trim(),
    category: values.category,
    amount: Number(values.amount),
    expenseDate: `${values.expenseDate}T00:00:00.000Z`,
    notes: emptyToNull(values.notes),
  };
}

function fromExpense(expense: Expense): ExpenseFormValues {
  return {
    title: expense.title ?? "",
    category: expense.category ?? "",
    amount: String(expense.amount ?? ""),
    expenseDate: expense.expenseDate ? expense.expenseDate.slice(0, 10) : "",
    notes: expense.notes ?? "",
  };
}

export function ExpenseFormDialog({ open, onOpenChange, expenseId }: ExpenseFormDialogProps) {
  const isEdit = Boolean(expenseId);
  const detailQuery = useExpenseQuery(open && isEdit ? expenseId : null);
  const categoriesQuery = useExpenseCategoriesQuery();
  const mutations = useExpenseMutations();
  const categories = categoriesQuery.data ?? [];

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: emptyExpenseForm(),
  });

  useEffect(() => {
    if (!open) {
      form.reset(emptyExpenseForm());
      return;
    }
    if (isEdit && detailQuery.data) {
      form.reset(fromExpense(detailQuery.data));
    }
    if (!isEdit) {
      form.reset(emptyExpenseForm());
    }
  }, [open, isEdit, detailQuery.data, form]);

  const isSubmitting = mutations.create.isPending || mutations.update.isPending;

  async function onSubmit(values: ExpenseFormValues) {
    try {
      if (isEdit && expenseId) {
        await mutations.update.mutateAsync({
          id: expenseId,
          body: toRequest(values),
        });
        toast.success("Expense updated successfully");
        onOpenChange(false);
        return;
      }

      await mutations.create.mutateAsync(toRequest(values));
      toast.success("Expense created successfully");
      onOpenChange(false);
    } catch (error) {
      form.setError("root", { message: getMutationErrorMessage(error) });
      if (!isValidationError(error)) {
        toast.error("Unable to save expense");
      }
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit expense" : "Add expense"}
      description="Expense records use title, category, amount, date, and notes. Categories come from a fixed backend list."
      icon={Wallet}
      size="md"
      isDirty={form.formState.isDirty}
      isSubmitting={isSubmitting}
      submitLabel={isEdit ? "Update" : "Create"}
      onSubmit={form.handleSubmit(onSubmit)}
    >
      {isEdit && detailQuery.isLoading ? (
        <LoadingState label="Loading expense..." />
      ) : (
        <>
          {form.formState.errors.root?.message ? (
            <Alert variant="destructive">
              <AlertDescription>{form.formState.errors.root.message}</AlertDescription>
            </Alert>
          ) : null}

          <FormField
            label="Title"
            htmlFor="expense-title"
            required
            error={form.formState.errors.title?.message}
          >
            <Input id="expense-title" disabled={isSubmitting} {...form.register("title")} />
          </FormField>
          <FormField
            label="Category"
            htmlFor="expense-category"
            required
            error={form.formState.errors.category?.message}
          >
            <Controller
              control={form.control}
              name="category"
              render={({ field }) => (
                <Select value={field.value || undefined} onValueChange={(value) => field.onChange(value ?? "")}>
                  <SelectTrigger id="expense-category" className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
          <FormField
            label="Amount"
            htmlFor="expense-amount"
            required
            error={form.formState.errors.amount?.message}
          >
            <Input
              id="expense-amount"
              type="number"
              min={0}
              step="0.01"
              disabled={isSubmitting}
              {...form.register("amount")}
            />
          </FormField>
          <FormField
            label="Date"
            htmlFor="expense-date"
            required
            error={form.formState.errors.expenseDate?.message}
          >
            <Input
              id="expense-date"
              type="date"
              disabled={isSubmitting}
              {...form.register("expenseDate")}
            />
          </FormField>
          <FormField label="Notes" htmlFor="expense-notes" error={form.formState.errors.notes?.message}>
            <Textarea id="expense-notes" disabled={isSubmitting} {...form.register("notes")} />
          </FormField>
        </>
      )}
    </FormDialog>
  );
}
