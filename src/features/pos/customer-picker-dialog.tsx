"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, Users } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { DataTableActions } from "@/components/shared/data-table-actions";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CustomerFormDialog } from "@/features/customers/customer-form-dialog";
import { useCustomersQuery } from "@/features/customers/use-customers";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { usePermission } from "@/hooks/use-permission";
import { permissions } from "@/config/permissions";
import { lookupCustomerByPhone } from "@/services/customers.service";
import { getErrorMessage } from "@/types/api";
import type { Customer } from "@/types/customer";
import type { CartCustomer } from "./cart-state";

type CustomerPickerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (customer: CartCustomer) => void;
};

const columns: DataTableColumn<Customer>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => row.original.name || "—",
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => row.original.phone || "—",
  },
];

export function CustomerPickerDialog({
  open,
  onOpenChange,
  onSelect,
}: CustomerPickerDialogProps) {
  const canCustomers = usePermission(permissions.customers);
  const canCreate = usePermission(permissions.customers);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const debouncedSearch = useDebouncedValue(search);
  const listQuery = useCustomersQuery(
    {
      search: debouncedSearch || undefined,
      isActive: true,
      page,
      pageSize: 20,
    },
    { enabled: open && canCustomers },
  );

  async function lookup() {
    const phone = search.trim();
    if (!/^\d{10}$/.test(phone)) {
      toast.error("Enter a 10-digit phone number to look up.");
      return;
    }
    try {
      const customer = await lookupCustomerByPhone(phone);
      if (!customer) {
        toast.error("Customer not found.");
        return;
      }
      onSelect({ id: customer.id, name: customer.name, phone: customer.phone });
      onOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error) || "Unable to look up customer");
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent size="md" showCloseButton>
          <DialogHeader icon={Users}>
            <DialogTitle>Select customer</DialogTitle>
            <DialogDescription>
              Walk-in sales do not require a customer. Search or look up by phone.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-3">
            <ListToolbar
              search={search}
              onSearchChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
              searchPlaceholder="Search name or phone"
              filters={
                <>
                  <Button type="button" variant="outline" size="sm" onClick={() => void lookup()}>
                    Lookup phone
                  </Button>
                  {canCreate ? (
                    <Button type="button" size="sm" onClick={() => setCreateOpen(true)}>
                      Add customer
                    </Button>
                  ) : null}
                </>
              }
            />
            {canCustomers ? (
              <DataTable
                columns={[
                  ...columns,
                  {
                    id: "actions",
                    header: "Actions",
                    cell: ({ row }) => (
                      <DataTableActions
                        actions={[
                          {
                            label: "Select",
                            icon: Check,
                            onClick: () => {
                              onSelect({
                                id: row.original.id,
                                name: row.original.name,
                                phone: row.original.phone,
                              });
                              onOpenChange(false);
                            },
                          },
                        ]}
                      />
                    ),
                  },
                ]}
                data={listQuery.data?.items ?? []}
                isLoading={listQuery.isLoading}
                isError={listQuery.isError}
                errorMessage={getErrorMessage(listQuery.error)}
                onRetry={() => void listQuery.refetch()}
                emptyTitle="No customers found"
                emptyDescription="Try a different search, or add a customer."
                page={listQuery.data?.page ?? page}
                pageCount={Math.max(1, listQuery.data?.totalPages ?? 1)}
                onPageChange={setPage}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                Customer list requires the customers permission. Phone lookup still works if the
                backend allows it.
              </p>
            )}
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <CustomerFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        customerId={null}
        onCreated={(customer) => {
          onSelect({ id: customer.id, name: customer.name, phone: customer.phone });
          onOpenChange(false);
        }}
      />
    </>
  );
}
