"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { RequirePermission } from "@/components/auth/require-permission";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { DataTableActions } from "@/components/shared/data-table-actions";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { permissions } from "@/config/permissions";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { usePermission } from "@/hooks/use-permission";
import { formatDate } from "@/lib/date";
import { getErrorMessage } from "@/types/api";
import type { Category } from "@/types/category";
import { CategoryFormDialog } from "./category-form-dialog";
import { useCategoriesQuery, useCategoryMutations } from "./use-categories";

const PAGE_SIZE = 20;

export function CategoriesPage() {
  const canManage = usePermission(permissions.categoriesManage);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const debouncedSearch = useDebouncedValue(search);

  const filters = { search: debouncedSearch || undefined };
  const listQuery = useCategoriesQuery(filters);
  const mutations = useCategoryMutations();

  const items = listQuery.data ?? [];
  const pageCount = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const pageItems = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const columns = useMemo<DataTableColumn<Category>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.name}</p>
            {row.original.parentCategoryName ? (
              <p className="text-xs text-muted-foreground">{row.original.parentCategoryName}</p>
            ) : null}
          </div>
        ),
      },
      {
        accessorKey: "productCount",
        header: "Products",
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => <StatusBadge active={row.original.isActive} />,
      },
      {
        accessorKey: "defaultShowOnPos",
        header: "POS",
        cell: ({ row }) => (row.original.defaultShowOnPos ? "Yes" : "No"),
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => formatDate(row.original.createdAt),
      },
      ...(canManage
        ? [
            {
              id: "actions",
              header: "Actions",
              cell: ({ row }) => (
                <DataTableActions
                  actions={[
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
                      variant: "destructive",
                      onClick: () => setDeleteTarget(row.original),
                    },
                  ]}
                />
              ),
            } satisfies DataTableColumn<Category>,
          ]
        : []),
    ],
    [canManage],
  );

  return (
    <RequirePermission permission={permissions.categories}>
      <PageContainer>
        <PageHeader
          title="Categories"
          description="Organize products into catalog groups used across POS Lite."
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
                Add category
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
              searchPlaceholder="Search categories"
            />
            <DataTable
              columns={columns}
              data={pageItems}
              isLoading={listQuery.isLoading}
              isError={listQuery.isError}
              errorMessage={getErrorMessage(listQuery.error)}
              onRetry={() => void listQuery.refetch()}
              emptyTitle="No categories yet"
              emptyDescription="Create a category to start organizing products."
              page={page}
              pageCount={pageCount}
              onPageChange={setPage}
            />
        </div>

        <CategoryFormDialog
          open={formOpen}
          onOpenChange={(open) => {
            setFormOpen(open);
            if (!open) {
              setEditId(null);
            }
          }}
          categoryId={editId}
        />

        <ConfirmDialog
          open={Boolean(deleteTarget)}
          onOpenChange={(open) => {
            if (!open) {
              setDeleteTarget(null);
            }
          }}
          title="Delete this category?"
          description="The category will be removed from active lists. This is a soft delete and can be restored later by an administrator."
          confirmLabel="Delete"
          loading={mutations.remove.isPending}
          onConfirm={async () => {
            if (!deleteTarget) {
              return;
            }
            try {
              await mutations.remove.mutateAsync(deleteTarget.id);
              toast.success("Category deleted successfully.");
              setDeleteTarget(null);
            } catch (error) {
              toast.error(getErrorMessage(error) || "The record could not be deleted");
            }
          }}
        />
      </PageContainer>
    </RequirePermission>
  );
}
