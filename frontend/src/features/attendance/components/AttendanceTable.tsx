import React from "react";
import {
  ColumnDef,
  PaginationState,
  SortingState,
  RowSelectionState,
} from "@tanstack/react-table";
import { Clock, User } from "lucide-react";
import { useNavigate } from "react-router";
import { format, parseISO } from "date-fns";
import { DataTable } from "@/components/data-display/DataTable";
import { AttendanceRecord } from "../types";
import { AttendanceStatusBadge } from "./AttendanceStatusBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/data-display/Avatar";

interface AttendanceTableProps {
  data: AttendanceRecord[];
  pageCount: number;
  pagination: PaginationState;
  onPaginationChange: React.Dispatch<React.SetStateAction<PaginationState>>;
  sorting: SortingState;
  onSortingChange: React.Dispatch<React.SetStateAction<SortingState>>;
  rowSelection: RowSelectionState;
  onRowSelectionChange: React.Dispatch<React.SetStateAction<RowSelectionState>>;
  isLoading: boolean;
}

function formatTime(dateStr?: string) {
  if (!dateStr) return "—";
  try {
    return format(parseISO(dateStr), "h:mm a");
  } catch {
    return dateStr;
  }
}

function formatDate(dateStr: string) {
  try {
    return format(parseISO(dateStr), "MMM d, yyyy");
  } catch {
    return dateStr;
  }
}

export function AttendanceTable({
  data,
  pageCount,
  pagination,
  onPaginationChange,
  sorting,
  onSortingChange,
  rowSelection,
  onRowSelectionChange,
  isLoading,
}: AttendanceTableProps) {
  const navigate = useNavigate();

  const columns = React.useMemo<ColumnDef<AttendanceRecord>[]>(
    () => [
      {
        accessorKey: "memberName",
        header: "Member",
        cell: ({ row }) => {
          const r = row.original;
          return (
            <div
              className="flex items-center gap-3 cursor-pointer min-w-0"
              onClick={() => navigate(`/admin/attendance/members/${r.memberId}`)}
            >
              <Avatar className="w-8 h-8 rounded-full border border-border-default shrink-0">
                <AvatarImage src={r.profilePhoto} />
                <AvatarFallback className="bg-surface text-text-secondary text-[10px] font-black uppercase">
                  {r.memberName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="font-semibold text-text-primary text-[13px] truncate hover:underline">
                  {r.memberName}
                </div>
                <div className="flex items-center text-xs text-text-muted gap-1.5 mt-0.5 font-mono">
                  <User className="h-3 w-3 shrink-0" />
                  <span className="truncate">{r.memberCode}</span>
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => (
          <span className="text-text-secondary text-[13px] font-mono">
            {formatDate(row.original.date)}
          </span>
        ),
      },
      {
        id: "checkIn",
        header: "Check In",
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 text-text-secondary text-[13px] font-mono">
            <Clock className="h-3.5 w-3.5 text-text-muted shrink-0" />
            {formatTime(row.original.checkInTime)}
          </div>
        ),
      },
      {
        id: "checkOut",
        header: "Check Out",
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 text-text-secondary text-[13px] font-mono">
            <Clock className="h-3.5 w-3.5 text-text-muted shrink-0" />
            {formatTime(row.original.checkOutTime)}
          </div>
        ),
      },
      {
        accessorKey: "planName",
        header: "Plan",
        cell: ({ row }) => (
          <span className="text-text-secondary font-medium text-[13px] font-mono">
            {row.original.planName || "—"}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <div className="flex justify-center">
            <AttendanceStatusBadge status={row.original.status} />
          </div>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const r = row.original;
          return (
            <div className="flex items-center justify-end">
              <button
                onClick={() =>
                  navigate(`/admin/attendance/members/${r.memberId}`)
                }
                className="bg-primary hover:opacity-90 text-primary-foreground px-3 py-1.5 rounded-[4px] text-[10px] font-bold transition-all duration-200 cursor-pointer border border-border-hover h-auto min-h-0"
              >
                History
              </button>
            </div>
          );
        },
      },
    ],
    [navigate]
  );

  return (
    <DataTable
      columns={columns}
      data={data}
      pageCount={pageCount}
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      sorting={sorting}
      onSortingChange={onSortingChange}
      rowSelection={rowSelection}
      onRowSelectionChange={onRowSelectionChange}
      isLoading={isLoading}
      enableColumnVisibility
    />
  );
}
