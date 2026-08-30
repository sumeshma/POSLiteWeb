"use client";

import { Wallet } from "lucide-react";
import { ViewDialog } from "@/components/shared/view-dialog";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { formatCurrency } from "@/lib/currency";
import { formatDate, formatDateTime } from "@/lib/date";
import { getErrorMessage } from "@/types/api";
import { useExpenseQuery } from "./use-expenses";

type ExpenseDetailDialogProps = {
  expenseId: string | null;
  onOpenChange: (open: boolean) => void;
};

export function ExpenseDetailDialog({ expenseId, onOpenChange }: ExpenseDetailDialogProps) {
  const open = Boolean(expenseId);
  const detailQuery = useExpenseQuery(open ? expenseId : null);
  const expense = detailQuery.data;

  return (
    <ViewDialog
      open={open}
      onOpenChange={onOpenChange}
      title={expense?.title || "Expense details"}
      description="The backend does not return a separate expense number for this record."
      icon={Wallet}
    >
      {detailQuery.isLoading ? (
        <LoadingState label="Loading expense..." />
      ) : detailQuery.isError ? (
        <ErrorState
          title="Unable to load expense details"
          description={getErrorMessage(detailQuery.error)}
          onRetry={() => void detailQuery.refetch()}
        />
      ) : expense ? (
        <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Category</dt>
            <dd className="font-medium">{expense.category || "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Amount</dt>
            <dd className="tabular-nums font-medium">{formatCurrency(expense.amount)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Date</dt>
            <dd>{formatDate(expense.expenseDate) || "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Recorded by</dt>
            <dd>{expense.createdByName || "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Created</dt>
            <dd>{formatDateTime(expense.createdAt) || "—"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-muted-foreground">Notes</dt>
            <dd>{expense.notes || "—"}</dd>
          </div>
        </dl>
      ) : null}
    </ViewDialog>
  );
}
