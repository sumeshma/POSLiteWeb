"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";
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
import { getErrorMessage } from "@/types/api";
import type { AppRole } from "@/types/role";
import { RoleFormDialog } from "./role-form-dialog";
import { useDeletedRolesQuery, useRoleMutations, useRolesQuery } from "./use-roles";

const PAGE_SIZE = 20;

export function RolesPage() {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"active" | "deleted">("active");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AppRole | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<AppRole | null>(null);
  const debouncedSearch = useDebouncedValue(search);
  const mutations = useRoleMutations();
  const listQuery = useRolesQuery({ enabled: view === "active" });
  const deletedQuery = useDeletedRolesQuery({ enabled: view === "deleted" });
  const isLoading = view === "deleted" ? deletedQuery.isLoading : listQuery.isLoading;
  const isError = view === "deleted" ? deletedQuery.isError : listQuery.isError;
  const error = view === "deleted" ? deletedQuery.error : listQuery.error;

  const filtered = useMemo(() => {
    const source = view === "deleted" ? (deletedQuery.data ?? []) : (listQuery.data ?? []);
    const query = debouncedSearch.trim().toLowerCase();
    if (!query) {
      return source;
    }
    return source.filter((role) =>
      [role.name, role.description, ...(role.permissions ?? [])]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [debouncedSearch, deletedQuery.data, listQuery.data, view]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const items = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const columns = useMemo<DataTableColumn<AppRole>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => <span className="font-medium">{row.original.name || "—"}</span>,
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => row.original.description || "—",
      },
      {
        accessorKey: "permissions",
        header: "Permissions",
        cell: ({ row }) => row.original.permissions?.length ?? 0,
      },
      {
        accessorKey: "assignedUserCount",
        header: "Users",
        cell: ({ row }) => row.original.assignedUserCount,
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => <StatusBadge active={row.original.isActive} />,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <DataTableActions
            actions={
              view === "active"
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
                : [
                    {
                      label: "Restore",
                      icon: RotateCcw,
                      onClick: () => setRestoreTarget(row.original),
                    },
                  ]
            }
          />
        ),
      },
    ],
    [view],
  );

  return (
    <RequirePermission permission={permissions.rolesManage}>
      <PageContainer>
        <PageHeader
          title="Roles"
          description="App roles and permission assignments from the backend catalog."
          actions={
            <Button
              type="button"
              onClick={() => {
                setEditId(null);
                setFormOpen(true);
              }}
            >
              <Plus />
              Add role
            </Button>
          }
        />

        <div className="space-y-4">
            <ListToolbar
              search={search}
              onSearchChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
              searchPlaceholder="Search roles"
              filters={
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
                    <SelectItem value="active">Active list</SelectItem>
                    <SelectItem value="deleted">Deleted</SelectItem>
                  </SelectContent>
                </Select>
              }
            />
            <div className="overflow-x-auto">
              <DataTable
                columns={columns}
                data={items}
                isLoading={isLoading}
                isError={isError}
                errorMessage={getErrorMessage(error)}
                onRetry={() => void (view === "deleted" ? deletedQuery.refetch() : listQuery.refetch())}
                emptyTitle={view === "deleted" ? "No deleted roles" : "No roles found"}
                emptyDescription={
                  view === "deleted"
                    ? "Soft-deleted roles will appear here if the server still has them."
                    : "Add a role, or try a different search."
                }
                page={currentPage}
                pageCount={pageCount}
                onPageChange={setPage}
              />
            </div>
        </div>

        <RoleFormDialog
          open={formOpen}
          onOpenChange={(open) => {
            setFormOpen(open);
            if (!open) {
              setEditId(null);
            }
          }}
          roleId={editId}
        />
        <ConfirmDialog
          open={Boolean(deleteTarget)}
          onOpenChange={(open) => {
            if (!open) {
              setDeleteTarget(null);
            }
          }}
          title="Delete this role?"
          description="The role will be soft-deleted. Restore is available from the deleted list."
          confirmLabel="Delete"
          loading={mutations.remove.isPending}
          onConfirm={async () => {
            if (!deleteTarget) {
              return;
            }
            try {
              await mutations.remove.mutateAsync(deleteTarget.id);
              toast.success("Role deleted successfully.");
              setDeleteTarget(null);
            } catch (error) {
              toast.error(getErrorMessage(error) || "Unable to delete role");
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
          title="Restore this role?"
          description="The role will be restored to the active list."
          confirmLabel="Restore"
          destructive={false}
          loading={mutations.restore.isPending}
          onConfirm={async () => {
            if (!restoreTarget) {
              return;
            }
            try {
              await mutations.restore.mutateAsync(restoreTarget.id);
              toast.success("Role restored successfully.");
              setRestoreTarget(null);
            } catch (error) {
              toast.error(getErrorMessage(error) || "Unable to restore role");
            }
          }}
        />
      </PageContainer>
    </RequirePermission>
  );
}
