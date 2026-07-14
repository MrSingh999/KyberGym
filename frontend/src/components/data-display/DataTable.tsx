import React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  PaginationState,
  SortingState,
  OnChangeFn,
  RowSelectionState,
} from "@tanstack/react-table";
import { cn } from "../../lib/utils";
import { Skeleton } from "../feedback/Skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  emptyMessage = "No records match your query.",
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    pageCount,
    state: {
      pagination,
      sorting,
      rowSelection,
    },
    onPaginationChange,
    onSortingChange,
    onRowSelectionChange,
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
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="py-3.5 px-5"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
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
                  className="table-row-hover table-zebra"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="py-3 px-5 align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="text-center py-16">
                  <p className="text-text-secondary text-sm font-semibold">No records match your query.</p>
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
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="p-1.5 border border-border-default rounded-[4px] text-text-secondary hover:text-text-primary hover:bg-elevated hover:border-border-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <div className="flex items-center space-x-1">
            {Array.from({ length: table.getPageCount() }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => table.setPageIndex(page - 1)}
                className={`h-7 w-7 rounded-[4px] text-xs font-bold font-mono transition-all cursor-pointer ${
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
            className="p-1.5 border border-border-default rounded-[4px] text-text-secondary hover:text-text-primary hover:bg-elevated hover:border-border-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
