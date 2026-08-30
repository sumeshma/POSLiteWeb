"use client";

import { useEffect, useMemo, useState } from "react";
import { flexRender } from "@tanstack/react-table";
import {
  getCoreRowModel,
  useLegacyTable,
  type LegacyColumnDef,
} from "@tanstack/react-table/legacy";
import type { RowData } from "@tanstack/table-core";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type DataTableColumn<TData extends RowData> = LegacyColumnDef<TData>;

const DEFAULT_PAGE_SIZE = 20;

type DataTableProps<TData extends RowData> = {
  columns: DataTableColumn<TData>[];
  data: TData[];
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  page?: number;
  pageCount?: number;
  onPageChange?: (page: number) => void;
  pageSize?: number;
  className?: string;
};

function isRowNumberColumn(columnId: string) {
  return columnId === "_rowNumber";
}

function isStickyEndColumn(columnId: string) {
  return columnId === "actions" || columnId === "select";
}

const stickyEndClass =
  "sticky right-0 z-10 border-l bg-card shadow-[-8px_0_8px_-8px_rgba(24,24,27,0.18)]";

export function DataTable<TData extends RowData>({
  columns,
  data,
  isLoading = false,
  isError = false,
  errorMessage,
  onRetry,
  emptyTitle = "No records found",
  emptyDescription = "Try adjusting search or filters, or add a new record.",
  page,
  pageCount,
  onPageChange,
  pageSize = DEFAULT_PAGE_SIZE,
  className,
}: DataTableProps<TData>) {
  const isControlled = typeof onPageChange === "function";
  const [internalPage, setInternalPage] = useState(1);

  const derivedPageCount = isControlled
    ? Math.max(1, pageCount ?? 1)
    : Math.max(1, Math.ceil(data.length / pageSize));

  useEffect(() => {
    if (!isControlled) {
      setInternalPage((current) => Math.min(current, derivedPageCount));
    }
  }, [derivedPageCount, isControlled]);

  const currentPage = isControlled ? (page ?? 1) : Math.min(internalPage, derivedPageCount);

  const tableData = useMemo(() => {
    if (isControlled) {
      return data;
    }
    const start = (currentPage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [currentPage, data, isControlled, pageSize]);

  const tableColumns = useMemo<DataTableColumn<TData>[]>(
    () => [
      {
        id: "_rowNumber",
        header: "#",
        cell: ({ row }) => (
          <span className="tabular-nums text-muted-foreground">
            {(currentPage - 1) * pageSize + row.index + 1}
          </span>
        ),
      },
      ...columns,
    ],
    [columns, currentPage, pageSize],
  );

  const table = useLegacyTable({
    data: tableData,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div className="space-y-2 py-2">
        <LoadingState label="Loading records..." />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Unable to load data"
        description={errorMessage ?? "Please check your connection and try again."}
        onRetry={onRetry}
      />
    );
  }

  const rows = table.getRowModel().rows;

  if (data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  function goToPage(nextPage: number) {
    if (isControlled) {
      onPageChange?.(nextPage);
      return;
    }
    setInternalPage(nextPage);
  }

  return (
    <div className={cn("space-y-3", className)}>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const sticky = isStickyEndColumn(header.column.id);
                const rowNumber = isRowNumberColumn(header.column.id);
                return (
                  <TableHead
                    key={header.id}
                    className={cn(
                      sticky && stickyEndClass,
                      sticky && "z-20 text-right",
                      rowNumber && "w-10 pr-3 text-muted-foreground",
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} className="group/row">
              {row.getVisibleCells().map((cell) => {
                const sticky = isStickyEndColumn(cell.column.id);
                return (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      "whitespace-nowrap",
                      sticky && stickyEndClass,
                      sticky && "group-hover/row:bg-muted/50",
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex items-center justify-end gap-2">
        <p className="mr-auto text-xs text-muted-foreground">
          Page {currentPage} of {derivedPageCount}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => goToPage(Math.max(1, currentPage - 1))}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={currentPage >= derivedPageCount}
          onClick={() => goToPage(Math.min(derivedPageCount, currentPage + 1))}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
