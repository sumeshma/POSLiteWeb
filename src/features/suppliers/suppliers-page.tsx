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
import { formatDate } from "@/lib/date";
import { getErrorMessage } from "@/types/api";
import type { Supplier } from "@/types/supplier";
import { SupplierFormDialog } from "./supplier-form-dialog";
import { useSupplierMutations, useSuppliersQuery } from "./use-suppliers";

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

export function SuppliersPage() {
  const canManage = usePermission(permissions.suppliersManage);
  const [search, setSearch] = useState("");
  const [isActive, setIsActive] = useState("all");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Supplier | null>(null);
  const debouncedSearch = useDebouncedValue(search);

  const listQuery = useSuppliersQuery({
    search: debouncedSearch || undefined,
    isActive: parseTriState(isActive),
  });
  const mutations = useSupplierMutations();
  const items = listQuery.data ?? [];
  const pageCount = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const pageItems = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const columns = useMemo<DataTableColumn<Supplier>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
      },
      {
        accessorKey: "contactPerson",
        header: "Contact",
        cell: ({ row }) => row.original.contactPerson || "—",
      },
      {
        accessorKey: "phoneNumber",
        header: "Phone",
        cell: ({ row }) => row.original.phoneNumber || "—",
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => row.original.email || "—",
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => <StatusBadge active={row.original.isActive} />,
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
            } satisfies DataTableColumn<Supplier>,
          ]
        : []),
    ],
    [canManage],
  );

  return (
    <RequirePermission permission={permissions.suppliers}>
      <PageContainer>
        <PageHeader
          title="Suppliers"
          description="Supplier master data. Purchasing workflows are not part of this version."
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
                Add supplier
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
              searchPlaceholder="Search suppliers"
              filters={
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
              }
            />
            <DataTable
              columns={columns}
              data={pageItems}
              isLoading={listQuery.isLoading}
              isError={listQuery.isError}
              errorMessage={getErrorMessage(listQuery.error)}
              onRetry={() => void listQuery.refetch()}
              emptyTitle="No suppliers found"
              emptyDescription="Add a supplier to keep vendor records in one place."
              page={page}
              pageCount={pageCount}
              onPageChange={setPage}
            />
        </div>

        <SupplierFormDialog
          open={formOpen}
          onOpenChange={(open) => {
            setFormOpen(open);
            if (!open) {
              setEditId(null);
            }
          }}
          supplierId={editId}
        />

        <ConfirmDialog
          open={Boolean(deleteTarget)}
          onOpenChange={(open) => {
            if (!open) {
              setDeleteTarget(null);
            }
          }}
          title="Delete this supplier?"
          description="The supplier will be removed from active lists. This is a soft delete and can be restored later by an administrator."
          confirmLabel="Delete"
          loading={mutations.remove.isPending}
          onConfirm={async () => {
            if (!deleteTarget) {
              return;
            }
            try {
              await mutations.remove.mutateAsync(deleteTarget.id);
              toast.success("Supplier deleted successfully.");
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
