"use client";

import { useMemo, useState } from "react";
import { PauseCircle, Play, X } from "lucide-react";
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
import { formatCurrency } from "@/lib/currency";
import { formatDateTime } from "@/lib/date";
import { getErrorMessage } from "@/types/api";
import type { HoldOrder } from "@/types/billing";
import { useHoldsQuery } from "./use-pos";

type HeldOrdersDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resuming: boolean;
  cancelling: boolean;
  onResume: (hold: HoldOrder) => void;
  onCancel: (hold: HoldOrder) => void;
};

export function HeldOrdersDialog({
  open,
  onOpenChange,
  resuming,
  cancelling,
  onResume,
  onCancel,
}: HeldOrdersDialogProps) {
  const [search, setSearch] = useState("");
  const listQuery = useHoldsQuery(search || undefined, { enabled: open });

  const columns = useMemo<DataTableColumn<HoldOrder>[]>(
    () => [
      {
        accessorKey: "holdNumber",
        header: "Hold",
        cell: ({ row }) => row.original.holdNumber || "—",
      },
      {
        accessorKey: "customerName",
        header: "Customer",
        cell: ({ row }) => row.original.customerName || "Walk-in",
      },
      {
        accessorKey: "totalAmount",
        header: "Total",
        cell: ({ row }) => formatCurrency(row.original.totalAmount),
      },
      {
        accessorKey: "holdDateTime",
        header: "When",
        cell: ({ row }) => formatDateTime(row.original.holdDateTime),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <DataTableActions
            actions={[
              {
                label: "Resume",
                icon: Play,
                disabled: resuming || cancelling,
                onClick: () => onResume(row.original),
              },
              {
                label: "Cancel",
                icon: X,
                variant: "destructive",
                disabled: resuming || cancelling,
                onClick: () => onCancel(row.original),
              },
            ]}
          />
        ),
      },
    ],
    [cancelling, onCancel, onResume, resuming],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg" showCloseButton>
        <DialogHeader icon={PauseCircle}>
          <DialogTitle>Held orders</DialogTitle>
          <DialogDescription>
            Resume loads the hold into the current cart. Cancel removes an active hold.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-3">
          <ListToolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search held orders"
          />
          <DataTable
            columns={columns}
            data={listQuery.data ?? []}
            isLoading={listQuery.isLoading}
            isError={listQuery.isError}
            errorMessage={getErrorMessage(listQuery.error)}
            onRetry={() => void listQuery.refetch()}
            emptyTitle="No held orders"
            emptyDescription="Hold the current cart to park a sale and resume it later."
          />
        </DialogBody>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
