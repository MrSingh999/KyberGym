import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  OnChangeFn,
} from "@tanstack/react-table";
import { ArrowUpDown, ArrowUp, ArrowDown, XCircle } from "lucide-react";
import { WorkoutAssignmentListItem } from "../types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
  const columns: ColumnDef<WorkoutAssignmentListItem>[] = [
    {
      accessorKey: "workoutTitle",
      header: ({ column }) => <SortHeader label="Workout" column={column} />,
      cell: ({ row }) => (
        <span className="font-medium text-primary font-mono text-[13px]">{row.original.workoutTitle}</span>
      ),
    },
    {
      accessorKey: "memberName",
      header: ({ column }) => <SortHeader label="Member" column={column} />,
      cell: ({ row }) => (
        <span className="text-sm text-text-primary font-mono">{row.original.memberName}</span>
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
      header: ({ column }) => <SortHeader label="Assigned" column={column} />,
      cell: ({ getValue }) => (
        <span className="text-sm text-muted font-mono">
          {new Date(getValue<string>()).toLocaleDateString()}
        </span>
      ),
      size: 120,
    },
    {
      id: "dates",
      header: "Period",
      cell: ({ row }) => {
        const { startDate, endDate } = row.original;
        if (!startDate && !endDate) return <span className="text-xs text-muted font-mono">—</span>;
        return (
          <span className="text-xs text-muted font-mono">
            {startDate ? new Date(startDate).toLocaleDateString() : "∞"}
            {" → "}
            {endDate ? new Date(endDate).toLocaleDateString() : "∞"}
          </span>
        );
      },
      size: 160,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        row.original.status === "ACTIVE" ? (
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(row.original.id); }}
            className="p-1.5 rounded-lg hover:bg-surface-hover text-muted hover:text-destructive transition-colors cursor-pointer"
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
    <div className="rounded-[16px] border border-default overflow-hidden bg-surface shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-default bg-elevated/50">
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    style={{ width: header.getSize() }}
                    className="text-left px-5 py-3.5 text-[10px] font-bold text-muted uppercase tracking-wider font-mono"
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
                  "border-b border-default/30 hover:bg-surface-hover transition-colors table-row-hover table-zebra",
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-5 py-3">
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
      className="flex items-center gap-1.5 hover:text-primary transition-colors group"
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
