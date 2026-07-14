import React, { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  PaginationState,
  SortingState,
  OnChangeFn,
  RowSelectionState,
  VisibilityState,
} from "@tanstack/react-table";
import { cn } from "../../lib/utils";
import { Skeleton } from "../feedback/Skeleton";
import { ChevronLeft, ChevronRight, Columns3 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageCount: number;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  sorting: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
  rowSelection: RowSelectionState;
  onRowSelectionChange: OnChangeFn<RowSelectionState>;
  isLoading?: boolean;
  className?: string;
  emptyMessage?: string;
  onRowClick?: (row: TData) => void;
  enableColumnVisibility?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageCount,
  pagination,
  onPaginationChange,
  sorting,
  onSortingChange,
  rowSelection,
  onRowSelectionChange,
  isLoading,
  className,
  onRowClick,
  enableColumnVisibility = false,
}: DataTableProps<TData, TValue>) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const table = useReactTable({
    data,
    columns,
    pageCount,
    state: {
      pagination,
      sorting,
      rowSelection,
      columnVisibility,
    },
    onPaginationChange,
    onSortingChange,
    onRowSelectionChange,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
  });

  return (
    <div className={cn("glass-panel rounded-[16px] overflow-hidden flex flex-col", className)}>
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="bg-elevated/50 border-b border-border-default text-text-muted text-[10px] uppercase tracking-wider font-bold font-mono">
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta as { className?: string } | undefined;
                  return (
                    <th
                      key={header.id}
                      className={cn("py-3.5 px-5", meta?.className)}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-border-default/30 text-sm">
            {isLoading ? (
              Array.from({ length: pagination.pageSize }).map((_, i) => (
                <tr key={i} className="table-row-hover table-zebra">
                  {columns.map((_, j) => (
                    <td key={j} className="py-3 px-5">
                      <Skeleton className="h-5 w-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    "table-row-hover table-zebra",
                    onRowClick && "cursor-pointer"
                  )}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta as { className?: string } | undefined;
                    return (
                      <td key={cell.id} className={cn("py-3 px-5 align-middle", meta?.className)}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="text-center py-16">
                  <p className="text-text-secondary text-sm font-semibold">No records match your criteria.</p>
                  <p className="text-xs text-text-muted mt-1 font-mono">Try adjusting search or filter criteria.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="flex items-center justify-between px-5 py-3 bg-surface border-t border-border-default">
        <div className="flex items-center space-x-2 text-xs text-text-muted font-mono">
          <span>
            {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}–
            {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, data.length)} of {table.getFilteredRowModel().rows.length}
          </span>
          {enableColumnVisibility && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="ml-2 p-1.5 border border-border-default rounded-[4px] text-text-secondary hover:text-text-primary hover:bg-elevated hover:border-border-hover transition-all cursor-pointer" title="Toggle columns">
                  <Columns3 className="h-3.5 w-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-surface border border-default shadow-xl rounded-lg py-1 z-50">
                {table.getAllLeafColumns().map((column) => {
                  if (column.id === "actions" || column.id === "select") return null;
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="px-4 py-2 text-sm text-primary hover:bg-surface-hover cursor-pointer transition-colors capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.columnDef.header as string || column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center border border-border-default rounded-[4px] text-text-secondary hover:text-text-primary hover:bg-elevated hover:border-border-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center space-x-1">
            {Array.from({ length: table.getPageCount() }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => table.setPageIndex(page - 1)}
                className={`min-w-[36px] h-9 rounded-[4px] text-xs font-bold font-mono transition-all cursor-pointer ${
                  table.getState().pagination.pageIndex === page - 1
                    ? "bg-primary text-primary-foreground"
                    : "text-text-secondary hover:text-text-primary hover:bg-elevated border border-transparent"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center border border-border-default rounded-[4px] text-text-secondary hover:text-text-primary hover:bg-elevated hover:border-border-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
