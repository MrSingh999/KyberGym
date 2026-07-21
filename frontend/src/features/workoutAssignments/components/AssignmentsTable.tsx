import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  OnChangeFn,
} from "@tanstack/react-table";
import { ArrowUpDown, ArrowUp, ArrowDown, XCircle, Calendar, User } from "lucide-react";
import { WorkoutAssignmentListItem } from "../types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router";
import { Avatar, AvatarFallback } from "@/components/data-display/Avatar";

interface AssignmentsTableProps {
  data: WorkoutAssignmentListItem[];
  onRemove: (id: string) => void;
  sorting: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
}

export function AssignmentsTable({
  data,
  onRemove,
  sorting,
  onSortingChange,
}: AssignmentsTableProps) {
  const navigate = useNavigate();

  const columns: ColumnDef<WorkoutAssignmentListItem>[] = [
    {
      accessorKey: "memberName",
      header: ({ column }) => <SortHeader label="Member" column={column} />,
      cell: ({ row }) => {
        const item = row.original;
        const initials = item.memberName
          ? item.memberName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
          : "MB";
        return (
          <div 
            onClick={() => navigate(`/admin/members/${item.memberId}`)}
            className="flex items-center gap-3 cursor-pointer group min-w-0"
          >
            <Avatar className="h-8 w-8 rounded-full border border-border-default shrink-0 group-hover:border-primary transition-colors">
              <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-black font-mono">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="font-semibold text-text-primary font-mono text-xs truncate group-hover:text-primary transition-colors">
              {item.memberName}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "workoutTitle",
      header: ({ column }) => <SortHeader label="Workout Program" column={column} />,
      cell: ({ row }) => (
        <span 
          onClick={() => navigate(`/admin/workouts/${row.original.workoutId}`)}
          className="font-bold text-text-primary hover:text-primary font-mono text-xs cursor-pointer truncate"
        >
          {row.original.workoutTitle}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => (
        row.original.status === "ACTIVE"
          ? <Badge variant="success">Active</Badge>
          : <Badge variant="destructive">Removed</Badge>
      ),
      size: 100,
    },
    {
      accessorKey: "assignedAt",
      header: ({ column }) => <SortHeader label="Assigned Date" column={column} />,
      cell: ({ getValue }) => (
        <span className="text-xs text-text-secondary font-mono">
          {new Date(getValue<string>()).toLocaleDateString()}
        </span>
      ),
      size: 120,
    },
    {
      id: "dates",
      header: "Schedule Period",
      cell: ({ row }) => {
        const { startDate, endDate } = row.original;
        if (!startDate && !endDate) return <span className="text-xs text-text-muted font-mono">—</span>;
        return (
          <div className="flex items-center gap-1.5 text-xs text-text-secondary font-mono">
            <Calendar className="h-3.5 w-3.5 text-text-muted shrink-0" />
            <span>
              {startDate ? new Date(startDate).toLocaleDateString() : "Ongoing"}
              {" → "}
              {endDate ? new Date(endDate).toLocaleDateString() : "Ongoing"}
            </span>
          </div>
        );
      },
      size: 180,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        row.original.status === "ACTIVE" ? (
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(row.original.id); }}
            className="p-1.5 rounded-md hover:bg-destructive/10 text-text-muted hover:text-destructive transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
            title="Remove assignment"
          >
            <XCircle className="w-4 h-4" />
          </button>
        ) : null
      ),
      size: 48,
    },
  ];

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
    manualSorting: true,
  });

  return (
    <div className="rounded-[16px] border border-border-default overflow-hidden bg-surface shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-border-default bg-surface-hover/50">
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    style={{ width: header.getSize() }}
                    className="text-left px-5 py-3.5 text-[10px] font-bold text-text-muted uppercase tracking-wider font-mono"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={cn(
                  "border-b border-border-default/40 hover:bg-surface-hover/60 transition-colors",
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-5 py-3.5">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SortHeader({ label, column }: { label: string; column: any }) {
  const sorted = column.getIsSorted();
  return (
    <button
      onClick={column.getToggleSortingHandler()}
      className="flex items-center gap-1.5 hover:text-text-primary transition-colors group cursor-pointer"
    >
      {label}
      {sorted === "asc" ? (
        <ArrowUp className="w-3.5 h-3.5 text-primary" />
      ) : sorted === "desc" ? (
        <ArrowDown className="w-3.5 h-3.5 text-primary" />
      ) : (
        <ArrowUpDown className="w-3.5 h-3.5 opacity-30 group-hover:opacity-70 transition-opacity" />
      )}
    </button>
  );
}

