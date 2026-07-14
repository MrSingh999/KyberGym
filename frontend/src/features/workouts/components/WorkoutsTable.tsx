import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  OnChangeFn,
} from "@tanstack/react-table";
import { useNavigate } from "react-router";
import { ArrowUpDown, ArrowUp, ArrowDown, Edit3, Trash2, MoreVertical, Users, Calendar } from "lucide-react";
import { WorkoutListItem } from "../types";
import { WorkoutStatusBadge } from "./WorkoutStatusBadge";
import { cn } from "@/lib/utils";

interface WorkoutsTableProps {
  data: WorkoutListItem[];
  onDelete: (id: string) => void;
  sorting: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
}

export function WorkoutsTable({
  data,
  onDelete,
  sorting,
  onSortingChange,
}: WorkoutsTableProps) {
  const navigate = useNavigate();

  const columns: ColumnDef<WorkoutListItem>[] = [
    {
      accessorKey: "title",
      header: ({ column }) => <SortHeader label="Workout" column={column} />,
      cell: ({ row }) => (
        <div>
          <span className="font-medium text-primary font-mono text-[13px]">{row.original.title}</span>
          {row.original.description && (
            <p className="text-xs text-muted truncate max-w-[300px] mt-0.5">
              {row.original.description}
            </p>
          )}
        </div>
      ),
    },
    {
      accessorKey: "assignmentType",
      header: ({ column }) => <SortHeader label="Assignment" column={column} />,
      cell: ({ getValue }) => {
        const val = getValue<WorkoutListItem["assignmentType"]>();
        return (
          <span className={cn(
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border font-mono",
            val === "ALL"
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 dark:border-emerald-500/15"
              : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 dark:border-indigo-500/15",
          )}>
            {val === "ALL" ? "All Members" : "Selected"}
          </span>
        );
      },
      size: 140,
    },
    {
      id: "members",
      header: "Members",
      cell: ({ row }) => (
        <span className="flex items-center gap-1.5 text-sm text-muted font-mono">
          <Users className="w-3.5 h-3.5" />
          {row.original.assignedMemberCount}
        </span>
      ),
      size: 100,
    },
    {
      id: "days",
      header: "Days",
      cell: ({ row }) => (
        <span className="flex items-center gap-1.5 text-sm text-muted font-mono">
          <Calendar className="w-3.5 h-3.5" />
          {row.original.daysCount}
        </span>
      ),
      size: 80,
    },
    {
      id: "isActive",
      header: "Status",
      cell: ({ row }) => <WorkoutStatusBadge isActive={row.original.isActive} />,
      size: 100,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <SortHeader label="Created" column={column} />,
      cell: ({ getValue }) => (
        <span className="text-sm text-muted font-mono">
          {new Date(getValue<string>()).toLocaleDateString()}
        </span>
      ),
      size: 110,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div onClick={(e) => e.stopPropagation()}>
          <details className="relative group">
            <summary className="list-none p-1.5 rounded-lg hover:bg-surface-hover text-muted hover:text-primary cursor-pointer">
              <MoreVertical className="w-4 h-4" />
            </summary>
            <div className="absolute right-0 top-full mt-1 z-20 bg-surface border border-default rounded-xl shadow-lg py-1.5 w-36 text-sm">
              <button
                onClick={() => navigate(`/admin/workouts/${row.original.id}/edit`)}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-surface-hover text-primary transition-colors"
              >
                <Edit3 className="h-3.5 w-3.5" /> Edit
              </button>
              <button
                onClick={() => onDelete(row.original.id)}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-surface-hover text-destructive transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" /> Deactivate
              </button>
            </div>
          </details>
        </div>
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
                onClick={() => navigate(`/admin/workouts/${row.original.id}`)}
                className={cn(
                  "border-b border-default/30 hover:bg-surface-hover transition-colors cursor-pointer table-row-hover table-zebra",
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
