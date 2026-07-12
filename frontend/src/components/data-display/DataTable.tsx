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
import { EmptyState } from "../feedback/EmptyState";
import { FileWarning } from "lucide-react";

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
  emptyMessage = "No results found.",
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
    <div className={cn("w-full rounded-xl border border-default bg-surface shadow-sm overflow-hidden flex flex-col", className)}>
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full caption-bottom text-sm">
          <thead className="bg-surface-hover/50 border-b border-default">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-default transition-colors hover:bg-surface-hover/50 data-[state=selected]:bg-primary/5">
                {headerGroup.headers.map((header) => {
                  return (
                    <th
                      key={header.id}
                      className="h-12 px-4 text-left align-middle font-medium text-muted [&:has([role=checkbox])]:pr-0 whitespace-nowrap"
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
          <tbody className="[&_tr:last-child]:border-0">
            {isLoading ? (
              Array.from({ length: pagination.pageSize }).map((_, i) => (
                <tr key={i} className="border-b border-default">
                  {columns.map((_, j) => (
                    <td key={j} className="p-4 align-middle">
                      <Skeleton className="h-5 w-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-b border-default transition-colors hover:bg-surface-hover/80 data-[state=selected]:bg-primary/5"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="h-64 text-center">
                  <EmptyState 
                    title="No Data" 
                    description={emptyMessage} 
                    icon={<FileWarning className="h-8 w-8 text-muted" />} 
                    className="border-none shadow-none"
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Footer / Pagination Controls */}
      <div className="flex items-center justify-between px-4 py-3 bg-surface border-t border-default">
        <div className="flex-1 text-sm text-muted">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium text-primary">Rows per page</p>
            <select
              className="h-8 w-[70px] rounded-md border border-default bg-surface px-2 py-1 text-sm text-primary focus:outline-none focus:ring-1 focus:ring-primary"
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value));
              }}
            >
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium text-primary">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <button
              className="h-8 w-8 p-0 rounded-md border border-default bg-surface hover:bg-surface-hover disabled:opacity-50 transition-colors"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              {"<"}
            </button>
            <button
              className="h-8 w-8 p-0 rounded-md border border-default bg-surface hover:bg-surface-hover disabled:opacity-50 transition-colors"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              {">"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
