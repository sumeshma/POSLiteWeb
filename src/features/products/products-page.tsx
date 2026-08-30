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
import { MediaThumb } from "@/components/shared/media-thumb";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { permissions } from "@/config/permissions";
import { useCategoriesQuery } from "@/features/categories/use-categories";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { usePermission } from "@/hooks/use-permission";
import { formatCurrency } from "@/lib/currency";
import { formatQuantity } from "@/lib/formatters";
import { getErrorMessage } from "@/types/api";
import type { Product } from "@/types/product";
import { ProductFormDialog } from "./product-form-dialog";
import { useProductMutations, useProductsQuery } from "./use-products";

const PAGE_SIZE = 20;

function parseTriState(value: string): boolean | undefined {
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  return undefined;
}

export function ProductsPage() {
  const canManage = usePermission(permissions.productsManage);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isActive, setIsActive] = useState("all");
  const [showOnPos, setShowOnPos] = useState("all");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const debouncedSearch = useDebouncedValue(search);
  const categoriesQuery = useCategoriesQuery({});

  const filters = {
    search: debouncedSearch || undefined,
    categoryId: categoryId || undefined,
    isActive: parseTriState(isActive),
    showOnPos: parseTriState(showOnPos),
  };
  const listQuery = useProductsQuery(filters);
  const mutations = useProductMutations();
  const items = listQuery.data ?? [];
  const pageCount = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const pageItems = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const columns = useMemo<DataTableColumn<Product>[]>(
    () => [
      {
        id: "image",
        header: "Image",
        cell: ({ row }) => (
          <MediaThumb src={row.original.imageUrl} alt={row.original.name ?? "Product"} />
        ),
      },
      {
        accessorKey: "name",
        header: "Product",
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">
              {row.original.sku}
              {row.original.size ? ` · ${row.original.size}` : ""}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "categoryName",
        header: "Category",
      },
      {
        accessorKey: "unit",
        header: "Unit",
      },
      {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) => formatCurrency(row.original.price),
      },
      {
        accessorKey: "stockQuantity",
        header: "Stock",
        cell: ({ row }) => formatQuantity(row.original.stockQuantity),
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => <StatusBadge active={row.original.isActive} />,
      },
      {
        accessorKey: "showOnPos",
        header: "POS",
        cell: ({ row }) => (row.original.showOnPos ? "Yes" : "No"),
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
            } satisfies DataTableColumn<Product>,
          ]
        : []),
    ],
    [canManage],
  );

  return (
    <RequirePermission permission={permissions.products}>
      <PageContainer>
          <PageHeader
            title="Products"
            description="Catalog items with category, unit, pricing, and POS visibility."
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
                  Add product
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
              searchPlaceholder="Search products"
              filters={
                <>
                  <Select
                    value={categoryId || "__all__"}
                    onValueChange={(value) => {
                      setCategoryId(value === "__all__" || value == null ? "" : value);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-44">
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">All categories</SelectItem>
                      {(categoriesQuery.data ?? []).map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={isActive}
                    onValueChange={(value) => {
                      setIsActive(value ?? "all");
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={showOnPos}
                    onValueChange={(value) => {
                      setShowOnPos(value ?? "all");
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All POS</SelectItem>
                      <SelectItem value="true">Shown on POS</SelectItem>
                      <SelectItem value="false">Hidden on POS</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              }
            />
            <DataTable
              columns={columns}
              data={pageItems}
              isLoading={listQuery.isLoading}
              isError={listQuery.isError}
              errorMessage={getErrorMessage(listQuery.error)}
              onRetry={() => void listQuery.refetch()}
              emptyTitle="No products found"
              emptyDescription="Try a different search, or add a product to the catalog."
              page={page}
              pageCount={pageCount}
              onPageChange={setPage}
            />
          </div>

        <ProductFormDialog
          open={formOpen}
          onOpenChange={(open) => {
            setFormOpen(open);
            if (!open) {
              setEditId(null);
            }
          }}
          productId={editId}
        />

        <ConfirmDialog
          open={Boolean(deleteTarget)}
          onOpenChange={(open) => {
            if (!open) {
              setDeleteTarget(null);
            }
          }}
          title="Delete this product?"
          description="The product will be removed from active lists. This is a soft delete and can be restored later by an administrator."
          confirmLabel="Delete"
          loading={mutations.remove.isPending}
          onConfirm={async () => {
            if (!deleteTarget) {
              return;
            }
            try {
              await mutations.remove.mutateAsync(deleteTarget.id);
              toast.success("Product deleted successfully.");
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
