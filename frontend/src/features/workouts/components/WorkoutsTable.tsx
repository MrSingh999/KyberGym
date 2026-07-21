import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  OnChangeFn,
} from "@tanstack/react-table";
import { useNavigate } from "react-router";
import { ArrowUpDown, ArrowUp, ArrowDown, Edit3, Trash2, MoreVertical, Copy, Archive, Calendar, Clock, Target, Eye } from "lucide-react";
import { WorkoutListItem } from "../types";
import { WorkoutStatusBadge } from "./WorkoutStatusBadge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface WorkoutsTableProps {
  data: WorkoutListItem[];
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onArchive: (id: string) => void;
  sorting: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
}

export function WorkoutsTable({
  data,
  onDelete,
  onDuplicate,
  onArchive,
  sorting,
  onSortingChange,
}: WorkoutsTableProps) {
  const navigate = useNavigate();

  function Dashed({ children }: { children: React.ReactNode }) {
    return children ?? <span className="text-text-muted/40 font-mono">&mdash;</span>;
  }

  const columns: ColumnDef<WorkoutListItem>[] = [
    {
      accessorKey: "title",
      header: ({ column }) => <SortHeader label="Workout" column={column} />,
      cell: ({ row }) => (
        <div className="min-w-0">
          <span className="font-semibold text-[14px] text-text-primary leading-tight block truncate">{row.original.title}</span>
          {row.original.description && (
            <p className="text-[11px] text-text-muted truncate max-w-[280px] mt-0.5 leading-relaxed">
              {row.original.description}
            </p>
          )}
        </div>
      ),
    },
    {
      id: "goal",
      header: "Goal",
      cell: ({ row }) => (
        <Dashed>
          {row.original.goal && (
            <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary font-mono">
              <Target className="w-3 h-3 text-text-muted" />
              {row.original.goal}
            </span>
          )}
        </Dashed>
      ),
      size: 140,
    },
    {
      id: "category",
      header: "Category",
      cell: ({ row }) => (
        <Dashed>
          {row.original.category && (
            <span className="inline-flex items-center text-[11px] font-medium font-mono bg-surface-hover text-text-secondary px-2 py-1 rounded-[6px] border border-border-default/50">
              {row.original.category}
            </span>
          )}
        </Dashed>
      ),
      size: 130,
    },
    {
      id: "estimatedDuration",
      header: "Duration",
      cell: ({ row }) => (
        <Dashed>
          {row.original.estimatedDuration && (
            <span className="flex items-center gap-1.5 text-xs text-text-secondary font-mono">
              <Clock className="w-3 h-3 text-text-muted" />
              {row.original.estimatedDuration}m
            </span>
          )}
        </Dashed>
      ),
      size: 100,
    },
    {
      id: "days",
      header: "Days",
      cell: ({ row }) => (
        <span className="flex items-center gap-1.5 text-xs text-text-secondary font-mono tabular-nums">
          <Calendar className="w-3.5 h-3.5 text-text-muted" />
          {row.original.daysCount}
        </span>
      ),
      size: 80,
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => <WorkoutStatusBadge status={row.original.status} />,
      size: 100,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <SortHeader label="Created" column={column} />,
      cell: ({ getValue }) => (
        <span className="text-xs text-text-secondary font-mono tabular-nums">
          {new Date(getValue<string>()).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      ),
      size: 120,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div onClick={(e) => e.stopPropagation()} className="flex items-center justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/admin/workouts/${row.original.id}`)}
            className="mr-1 text-text-muted hover:text-text-primary"
            title="View workout"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-text-muted hover:text-text-primary">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => navigate(`/admin/workouts/${row.original.id}`)}>
                <Edit3 className="h-4 w-4" /> View / Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate(row.original.id)}>
                <Copy className="h-4 w-4" /> Duplicate
              </DropdownMenuItem>
              {row.original.status !== "ARCHIVED" && (
                <DropdownMenuItem onClick={() => onArchive(row.original.id)}>
                  <Archive className="h-4 w-4" /> Archive
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onDelete(row.original.id)}
              >
                <Trash2 className="h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      size: 100,
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
    <div className="rounded-[14px] border border-border-default overflow-hidden bg-surface shadow-sm">
      <div className="overflow-x-auto overflow-y-auto">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-border-default">
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    style={{ width: header.getSize() }}
                    className="sticky top-0 z-10 text-left px-5 py-3.5 text-[10px] font-bold text-text-muted uppercase tracking-widest font-mono bg-elevated/80 backdrop-blur-sm border-b border-border-default"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, i) => (
              <tr
                key={row.id}
                onClick={() => navigate(`/admin/workouts/${row.original.id}`)}
                className={cn(
                  "group border-b border-border-default/40 last:border-b-0",
                  "hover:bg-surface-hover hover:shadow-sm transition-all duration-150 cursor-pointer",
                  i % 2 === 0 ? "bg-surface" : "bg-black/[0.01] dark:bg-white/[0.01]",
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-5 py-4">
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
        <ArrowUp className="w-3 h-3 text-text-primary" />
      ) : sorted === "desc" ? (
        <ArrowDown className="w-3 h-3 text-text-primary" />
      ) : (
        <ArrowUpDown className="w-3 h-3 text-text-muted/40 group-hover:text-text-muted transition-colors" />
      )}
    </button>
  );
}
