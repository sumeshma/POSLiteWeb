"use client";

import { useMemo, useState } from "react";
import { KeyRound, LogOut, Pencil, Plus, RotateCcw, Trash2, UserCheck, UserX } from "lucide-react";
import { toast } from "sonner";
import { RequirePermission } from "@/components/auth/require-permission";
import { useAuth } from "@/components/auth/auth-provider";
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
import { formatDateTime } from "@/lib/date";
import { getErrorMessage } from "@/types/api";
import { getShopUserDisplayName, type ShopUser } from "@/types/user";
import { ForceLogoutDialog } from "./force-logout-dialog";
import { ResetPasswordDialog } from "./reset-password-dialog";
import { toUpdateUserRequestFromShopUser } from "./user-mappers";
import { UserFormDialog } from "./user-form-dialog";
import { useDeletedUsersQuery, useUserMutations, useUsersQuery } from "./use-users";

const PAGE_SIZE = 20;

export function UsersPage() {
  const { user: currentUser } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [view, setView] = useState<"active" | "deleted">("active");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [resetUser, setResetUser] = useState<ShopUser | null>(null);
  const [forceLogoutUser, setForceLogoutUser] = useState<ShopUser | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<ShopUser | null>(null);
  const [activateTarget, setActivateTarget] = useState<ShopUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ShopUser | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<ShopUser | null>(null);
  const debouncedSearch = useDebouncedValue(search);
  const mutations = useUserMutations();

  const listQuery = useUsersQuery({ enabled: view === "active" });
  const deletedQuery = useDeletedUsersQuery({ enabled: view === "deleted" });
  const isLoading = view === "deleted" ? deletedQuery.isLoading : listQuery.isLoading;
  const isError = view === "deleted" ? deletedQuery.isError : listQuery.isError;
  const error = view === "deleted" ? deletedQuery.error : listQuery.error;

  const filtered = useMemo(() => {
    const source = view === "deleted" ? (deletedQuery.data ?? []) : (listQuery.data ?? []);
    const query = debouncedSearch.trim().toLowerCase();
    return source.filter((item) => {
      if (status === "true" && !item.isActive) {
        return false;
      }
      if (status === "false" && item.isActive) {
        return false;
      }
      if (!query) {
        return true;
      }
      const haystack = [
        getShopUserDisplayName(item),
        item.username,
        item.email,
        item.role,
        item.appRoleName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [debouncedSearch, deletedQuery.data, listQuery.data, status, view]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const items = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const columns = useMemo<DataTableColumn<ShopUser>[]>(
    () => [
      {
        accessorKey: "username",
        header: "User",
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{getShopUserDisplayName(row.original)}</p>
            <p className="text-xs text-muted-foreground">{row.original.username || "—"}</p>
          </div>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => row.original.email || "—",
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => (
          <span>
            {row.original.role || "—"}
            {row.original.appRoleName ? ` · ${row.original.appRoleName}` : ""}
          </span>
        ),
      },
      {
        accessorKey: "isOnline",
        header: "Session",
        cell: ({ row }) => (
          <StatusBadge
            active={row.original.isOnline}
            activeLabel="Online"
            inactiveLabel="Offline"
          />
        ),
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => <StatusBadge active={row.original.isActive} />,
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => formatDateTime(row.original.createdAt) || "—",
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const isCurrent = row.original.id === currentUser?.id;
          if (view !== "active") {
            return (
              <DataTableActions
                actions={[
                  {
                    label: "Restore",
                    icon: RotateCcw,
                    onClick: () => setRestoreTarget(row.original),
                  },
                ]}
              />
            );
          }

          return (
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
                  label: "Reset password",
                  icon: KeyRound,
                  onClick: () => setResetUser(row.original),
                },
                ...(!isCurrent
                  ? [
                      {
                        label: "Force logout",
                        icon: LogOut,
                        onClick: () => setForceLogoutUser(row.original),
                      },
                    ]
                  : []),
                ...(!isCurrent && row.original.isActive
                  ? [
                      {
                        label: "Deactivate",
                        icon: UserX,
                        onClick: () => setDeactivateTarget(row.original),
                      },
                    ]
                  : []),
                ...(!row.original.isActive
                  ? [
                      {
                        label: "Activate",
                        icon: UserCheck,
                        onClick: () => setActivateTarget(row.original),
                      },
                    ]
                  : []),
                ...(!isCurrent
                  ? [
                      {
                        label: "Delete",
                        icon: Trash2,
                        variant: "destructive" as const,
                        onClick: () => setDeleteTarget(row.original),
                      },
                    ]
                  : []),
              ]}
            />
          );
        },
      },
    ],
    [currentUser?.id, view],
  );

  async function setActive(target: ShopUser, isActive: boolean) {
    try {
      await mutations.update.mutateAsync({
        id: target.id,
        body: toUpdateUserRequestFromShopUser(target, { isActive }),
      });
      toast.success(isActive ? "User activated successfully." : "User deactivated successfully.");
      setActivateTarget(null);
      setDeactivateTarget(null);
    } catch (error) {
      toast.error(getErrorMessage(error) || "Unable to update user");
    }
  }

  return (
    <RequirePermission permission={permissions.usersManage}>
      <PageContainer>
        <PageHeader
          title="Users"
          description="Shop users, identity roles, and app-role permissions. Password complexity is enforced by the backend."
          actions={
            <Button
              type="button"
              onClick={() => {
                setEditId(null);
                setFormOpen(true);
              }}
            >
              <Plus />
              Add user
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
              searchPlaceholder="Search users"
              filters={
                <>
                  <Select
                    value={status}
                    onValueChange={(value) => {
                      setStatus(value ?? "all");
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
                onRetry={() => void (view === "deleted" ? deletedQuery.refetch() : listQuery.refetch())}
                emptyTitle={view === "deleted" ? "No deleted users" : "No users found"}
                emptyDescription={
                  view === "deleted"
                    ? "Soft-deleted users will appear here if the server still has them."
                    : "Add a user, or try a different search."
                }
                page={currentPage}
                pageCount={pageCount}
                onPageChange={setPage}
              />
            </div>
        </div>

        <UserFormDialog
          open={formOpen}
          onOpenChange={(open) => {
            setFormOpen(open);
            if (!open) {
              setEditId(null);
            }
          }}
          userId={editId}
        />
        <ResetPasswordDialog user={resetUser} onOpenChange={(open) => !open && setResetUser(null)} />
        <ForceLogoutDialog
          user={forceLogoutUser}
          onOpenChange={(open) => !open && setForceLogoutUser(null)}
        />
        <ConfirmDialog
          open={Boolean(deactivateTarget)}
          onOpenChange={(open) => {
            if (!open) {
              setDeactivateTarget(null);
            }
          }}
          title="Deactivate this user?"
          description="The user will be marked inactive and may no longer be able to sign in."
          confirmLabel="Deactivate"
          loading={mutations.update.isPending}
          onConfirm={() => deactivateTarget && void setActive(deactivateTarget, false)}
        />
        <ConfirmDialog
          open={Boolean(activateTarget)}
          onOpenChange={(open) => {
            if (!open) {
              setActivateTarget(null);
            }
          }}
          title="Activate this user?"
          description="The user will be marked active."
          confirmLabel="Activate"
          destructive={false}
          loading={mutations.update.isPending}
          onConfirm={() => activateTarget && void setActive(activateTarget, true)}
        />
        <ConfirmDialog
          open={Boolean(deleteTarget)}
          onOpenChange={(open) => {
            if (!open) {
              setDeleteTarget(null);
            }
          }}
          title="Delete this user?"
          description="The user will be soft-deleted. Restore is available from the deleted list."
          confirmLabel="Delete"
          loading={mutations.remove.isPending}
          onConfirm={async () => {
            if (!deleteTarget) {
              return;
            }
            try {
              await mutations.remove.mutateAsync(deleteTarget.id);
              toast.success("User deleted successfully.");
              setDeleteTarget(null);
            } catch (error) {
              toast.error(getErrorMessage(error) || "Unable to delete user");
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
          title="Restore this user?"
          description="The user will be restored to the active list."
          confirmLabel="Restore"
          destructive={false}
          loading={mutations.restore.isPending}
          onConfirm={async () => {
            if (!restoreTarget) {
              return;
            }
            try {
              await mutations.restore.mutateAsync(restoreTarget.id);
              toast.success("User restored successfully.");
              setRestoreTarget(null);
            } catch (error) {
              toast.error(getErrorMessage(error) || "Unable to restore user");
            }
          }}
        />
      </PageContainer>
    </RequirePermission>
  );
}
