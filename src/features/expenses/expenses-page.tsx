"use client";

import { useMemo, useState } from "react";
import { Eye, Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { RequirePermission } from "@/components/auth/require-permission";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { DataTableActions } from "@/components/shared/data-table-actions";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { permissions } from "@/config/permissions";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { usePermission } from "@/hooks/use-permission";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/date";
import { getErrorMessage } from "@/types/api";
import type { Expense } from "@/types/expense";
import { ExpenseDetailDialog } from "./expense-detail-dialog";
import { ExpenseFormDialog } from "./expense-form-dialog";
import {
  useDeletedExpensesQuery,
  useExpenseCategoriesQuery,
  useExpenseMutations,
  useExpensesQuery,
} from "./use-expenses";

const PAGE_SIZE = 20;

export function ExpensesPage() {
  const canManage = usePermission(permissions.expensesManage);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [view, setView] = useState<"active" | "deleted">("active");
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<Expense | null>(null);
  const debouncedSearch = useDebouncedValue(search);
  const categoriesQuery = useExpenseCategoriesQuery();
  const mutations = useExpenseMutations();

  const listQuery = useExpensesQuery(
    {
      search: debouncedSearch || undefined,
      category: category === "all" ? undefined : category,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
      page,
      pageSize: PAGE_SIZE,
    },
    { enabled: view === "active" },
  );
  const deletedQuery = useDeletedExpensesQuery({ enabled: view === "deleted" && canManage });
  const pageResult = listQuery.data;
  const activeItems = pageResult?.items ?? [];
  const deletedItems = deletedQuery.data ?? [];
  const items = view === "deleted" ? deletedItems : activeItems;
  const isLoading = view === "deleted" ? deletedQuery.isLoading : listQuery.isLoading;
  const isError = view === "deleted" ? deletedQuery.isError : listQuery.isError;
  const error = view === "deleted" ? deletedQuery.error : listQuery.error;

  const columns = useMemo<DataTableColumn<Expense>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => (
          <button
            type="button"
            className="font-medium text-primary hover:underline"
            onClick={() => setDetailId(row.original.id)}
          >
            {row.original.title || "—"}
          </button>
        ),
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => row.original.category || "—",
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => (
          <span className="tabular-nums">{formatCurrency(row.original.amount)}</span>
        ),
      },
      {
        accessorKey: "expenseDate",
        header: "Date",
        cell: ({ row }) => formatDate(row.original.expenseDate) || "—",
      },
      {
        accessorKey: "createdByName",
        header: "Recorded by",
        cell: ({ row }) => row.original.createdByName || "—",
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <DataTableActions
            actions={[
              {
                label: "View details",
                icon: Eye,
                onClick: () => setDetailId(row.original.id),
              },
              ...(canManage && view === "active"
                ? [
                    {
                      label: "Edit",
                      icon: Pencil,
                      onClick: () => {
                        setEditId(row.original.id);
                        setFormOpen(true);
                      },
                    },
                    {
                      label: "Delete",
                      icon: Trash2,
                      variant: "destructive" as const,
                      onClick: () => setDeleteTarget(row.original),
                    },
                  ]
                : []),
              ...(canManage && view === "deleted"
                ? [
                    {
                      label: "Restore",
                      icon: RotateCcw,
                      onClick: () => setRestoreTarget(row.original),
                    },
                  ]
                : []),
            ]}
          />
        ),
      },
    ],
    [canManage, view],
  );

  return (
    <RequirePermission permission={permissions.expenses}>
      <PageContainer>
        <PageHeader
          title="Expenses"
          description="Daily shop expenses. Categories are a fixed backend list and cannot be created from this app."
          actions={
            canManage ? (
              <Button
                type="button"
                onClick={() => {
                  setEditId(null);
                  setFormOpen(true);
                }}
              >
                <Plus />
                Add expense
              </Button>
            ) : null
          }
        />

        <div className="space-y-4">
            <ListToolbar
              search={search}
              onSearchChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
              searchPlaceholder="Search expenses"
              filters={
                <>
                  <Select
                    value={category}
                    onValueChange={(value) => {
                      setCategory(value ?? "all");
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All categories</SelectItem>
                      {(categoriesQuery.data ?? []).map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="date"
                    value={fromDate}
                    aria-label="From date"
                    className="w-36"
                    onChange={(event) => {
                      setFromDate(event.target.value);
                      setPage(1);
                    }}
                  />
                  <Input
                    type="date"
                    value={toDate}
                    aria-label="To date"
                    className="w-36"
                    onChange={(event) => {
                      setToDate(event.target.value);
                      setPage(1);
                    }}
                  />
                  {canManage ? (
                    <Select
                      value={view}
                      onValueChange={(value) => {
                        setView(value === "deleted" ? "deleted" : "active");
                        setPage(1);
                      }}
                    >
                      <SelectTrigger className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="deleted">Deleted</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : null}
                </>
              }
            />
            <div className="overflow-x-auto">
              <DataTable
                columns={columns}
                data={items}
                isLoading={isLoading}
                isError={isError}
                errorMessage={getErrorMessage(error)}
                onRetry={() =>
                  void (view === "deleted" ? deletedQuery.refetch() : listQuery.refetch())
                }
                emptyTitle={view === "deleted" ? "No deleted expenses" : "No expenses found"}
                emptyDescription={
                  view === "deleted"
                    ? "Deleted expenses will appear here if the server still has them."
                    : "Add an expense, or try a different search or date range."
                }
                page={view === "active" ? (pageResult?.page ?? page) : undefined}
                pageCount={view === "active" ? Math.max(1, pageResult?.totalPages ?? 1) : undefined}
                onPageChange={view === "active" ? setPage : undefined}
              />
            </div>
        </div>

        <ExpenseFormDialog
          open={formOpen}
          onOpenChange={(open) => {
            setFormOpen(open);
            if (!open) {
              setEditId(null);
            }
          }}
          expenseId={editId}
        />
        <ExpenseDetailDialog
          expenseId={detailId}
          onOpenChange={(open) => {
            if (!open) {
              setDetailId(null);
            }
          }}
        />
        <ConfirmDialog
          open={Boolean(deleteTarget)}
          onOpenChange={(open) => {
            if (!open) {
              setDeleteTarget(null);
            }
          }}
          title="Delete this expense?"
          description="The expense will be deleted. It can be restored from the deleted list if the server supports it."
          confirmLabel="Delete"
          loading={mutations.remove.isPending}
          onConfirm={async () => {
            if (!deleteTarget) {
              return;
            }
            try {
              await mutations.remove.mutateAsync(deleteTarget.id);
              toast.success("Expense deleted successfully");
              setDeleteTarget(null);
            } catch (caught) {
              toast.error(getErrorMessage(caught) || "Unable to delete expense");
            }
          }}
        />
        <ConfirmDialog
          open={Boolean(restoreTarget)}
          onOpenChange={(open) => {
            if (!open) {
              setRestoreTarget(null);
            }
          }}
          title="Restore this expense?"
          description="The expense will be restored to the active list."
          confirmLabel="Restore"
          destructive={false}
          loading={mutations.restore.isPending}
          onConfirm={async () => {
            if (!restoreTarget) {
              return;
            }
            try {
              await mutations.restore.mutateAsync(restoreTarget.id);
              toast.success("Expense restored successfully");
              setRestoreTarget(null);
            } catch (caught) {
              toast.error(getErrorMessage(caught) || "Unable to restore expense");
            }
          }}
        />
      </PageContainer>
    </RequirePermission>
  );
}
