"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, UserX } from "lucide-react";
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
import type { Customer } from "@/types/customer";
import { CustomerFormDialog } from "./customer-form-dialog";
import { useCustomerMutations, useCustomersQuery } from "./use-customers";

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

export function CustomersPage() {
  const canView = usePermission(permissions.customers);
  const canManage = usePermission(permissions.customersManage);
  const [search, setSearch] = useState("");
  const [isActive, setIsActive] = useState("all");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<Customer | null>(null);
  const debouncedSearch = useDebouncedValue(search);

  const listQuery = useCustomersQuery({
    search: debouncedSearch || undefined,
    isActive: parseTriState(isActive),
    page,
    pageSize: PAGE_SIZE,
  });
  const mutations = useCustomerMutations();
  const pageResult = listQuery.data;
  const items = pageResult?.items ?? [];

  const columns = useMemo<DataTableColumn<Customer>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
      },
      { accessorKey: "phone", header: "Phone" },
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
                    ...(row.original.isActive
                      ? [
                          {
                            label: "Deactivate",
                            icon: UserX,
                            variant: "destructive" as const,
                            onClick: () => setDeactivateTarget(row.original),
                          },
                        ]
                      : []),
                  ]}
                />
              ),
            } satisfies DataTableColumn<Customer>,
          ]
        : []),
    ],
    [canManage],
  );

  return (
    <RequirePermission permission={permissions.customers}>
      <PageContainer>
        <PageHeader
          title="Customers"
          description="Shop customer contacts. Phone numbers must be unique."
          actions={
            canView ? (
              <Button
                type="button"
                onClick={() => {
                  setEditId(null);
                  setFormOpen(true);
                }}
              >
                <Plus />
                Add customer
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
              searchPlaceholder="Search customers"
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
              data={items}
              isLoading={listQuery.isLoading}
              isError={listQuery.isError}
              errorMessage={getErrorMessage(listQuery.error)}
              onRetry={() => void listQuery.refetch()}
              emptyTitle="No customers found"
              emptyDescription="Add a customer, or try a different search."
              page={pageResult?.page ?? page}
              pageCount={Math.max(1, pageResult?.totalPages ?? 1)}
              onPageChange={setPage}
            />
        </div>

        <CustomerFormDialog
          open={formOpen}
          onOpenChange={(open) => {
            setFormOpen(open);
            if (!open) {
              setEditId(null);
            }
          }}
          customerId={editId}
        />

        <ConfirmDialog
          open={Boolean(deactivateTarget)}
          onOpenChange={(open) => {
            if (!open) {
              setDeactivateTarget(null);
            }
          }}
          title="Deactivate this customer?"
          description="The customer will be marked inactive. There is no delete endpoint for customers."
          confirmLabel="Deactivate"
          loading={mutations.update.isPending}
          onConfirm={async () => {
            if (!deactivateTarget) {
              return;
            }
            try {
              await mutations.update.mutateAsync({
                id: deactivateTarget.id,
                body: {
                  name: deactivateTarget.name ?? "",
                  phone: deactivateTarget.phone ?? "",
                  email: deactivateTarget.email,
                  isActive: false,
                },
              });
              toast.success("Customer updated successfully.");
              setDeactivateTarget(null);
            } catch (error) {
              toast.error(getErrorMessage(error) || "Unable to save changes");
            }
          }}
        />
      </PageContainer>
    </RequirePermission>
  );
}
