import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  OnChangeFn,
} from '@tanstack/react-table';
import { useNavigate } from 'react-router';
import { ArrowUpDown, ArrowUp, ArrowDown, Edit3, Copy, Archive, MoreVertical } from 'lucide-react';
import { PlanListItem, DURATION_TYPE_LABELS } from '../types';
import { PlanStatusBadge } from './PlanStatusBadge';
import { cn } from '../../../../lib/utils';

interface PlansTableProps {
  data: PlanListItem[];
  onDuplicate: (id: string) => void;
  onArchive: (id: string) => void;
  rowSelection: Record<string, boolean>;
  onRowSelectionChange: OnChangeFn<Record<string, boolean>>;
  sorting: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
}

export function PlansTable({
  data,
  onDuplicate,
  onArchive,
  rowSelection,
  onRowSelectionChange,
  sorting,
  onSortingChange,
}: PlansTableProps) {
  const navigate = useNavigate();

  const columns: ColumnDef<PlanListItem>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
          className="rounded border-default w-4 h-4 accent-primary cursor-pointer"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          onClick={(e) => e.stopPropagation()}
          className="rounded border-default w-4 h-4 accent-primary cursor-pointer"
        />
      ),
      size: 40,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <SortHeader label="Plan Name" column={column} />
      ),
      cell: ({ row }) => (
        <div>
          <div className="flex items-center gap-2">
            {row.original.color && (
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: row.original.color }}
              />
            )}
            <span className="font-medium text-primary">{row.original.name}</span>
            {row.original.isPopular && (
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">⭐</span>
            )}
          </div>
          {row.original.description && (
            <p className="text-xs text-muted mt-0.5 truncate max-w-[280px]">
              {row.original.description}
            </p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'price',
      header: ({ column }) => <SortHeader label="Price" column={column} />,
      cell: ({ getValue }) => (
        <span className="font-semibold text-primary tabular-nums">${getValue<number>()}</span>
      ),
      size: 90,
    },
    {
      id: 'duration',
      header: 'Duration',
      cell: ({ row }) => (
        <span className="text-secondary">
          {row.original.duration} {DURATION_TYPE_LABELS[row.original.durationType]}
        </span>
      ),
      size: 120,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => <PlanStatusBadge status={getValue<PlanListItem['status']>()} />,
      size: 110,
    },
    {
      id: 'features',
      header: 'Features',
      cell: ({ row }) => (
        <span className="text-xs text-muted tabular-nums">
          {row.original.featureCount} included
        </span>
      ),
      size: 100,
    },
    {
      id: 'members',
      header: 'Members',
      cell: ({ row }) => (
        <span className="text-xs text-muted tabular-nums">{row.original.memberCount ?? 0}</span>
      ),
      size: 90,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div onClick={(e) => e.stopPropagation()}>
          <details className="relative group">
            <summary className="list-none p-1.5 rounded-lg hover:bg-surface-hover text-muted hover:text-primary cursor-pointer">
              <MoreVertical className="w-4 h-4" />
            </summary>
            <div className="absolute right-0 bottom-full mb-1 z-20 bg-surface border border-default rounded-xl shadow-lg py-1.5 w-36 text-sm">
              <button
                onClick={() => navigate(`/dashboard/plans/${row.original.id}/edit`)}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-surface-hover text-primary transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit
              </button>
              <button
                onClick={() => onDuplicate(row.original.id)}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-surface-hover text-primary transition-colors"
              >
                <Copy className="w-3.5 h-3.5" /> Duplicate
              </button>
              {row.original.status !== 'archived' && (
                <button
                  onClick={() => onArchive(row.original.id)}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-surface-hover text-destructive transition-colors"
                >
                  <Archive className="w-3.5 h-3.5" /> Archive
                </button>
              )}
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
    state: { rowSelection, sorting },
    onRowSelectionChange,
    onSortingChange,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
    manualSorting: true,
  });

  return (
    <div className="rounded-xl border border-default overflow-hidden bg-surface shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-default bg-surface-hover">
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    style={{ width: header.getSize() }}
                    className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide"
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
                onClick={() => navigate(`/dashboard/plans/${row.original.id}`)}
                className={cn(
                  'border-b border-subtle hover:bg-surface-hover transition-colors cursor-pointer',
                  row.getIsSelected() && 'bg-primary/5',
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3.5">
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

// ─── Sort header helper ───────────────────────────────────────────────────────

function SortHeader({ label, column }: { label: string; column: any }) {
  const sorted = column.getIsSorted();
  return (
    <button
      onClick={column.getToggleSortingHandler()}
      className="flex items-center gap-1.5 hover:text-primary transition-colors group"
    >
      {label}
      {sorted === 'asc' ? (
        <ArrowUp className="w-3.5 h-3.5 text-primary" />
      ) : sorted === 'desc' ? (
        <ArrowDown className="w-3.5 h-3.5 text-primary" />
      ) : (
        <ArrowUpDown className="w-3.5 h-3.5 opacity-30 group-hover:opacity-70 transition-opacity" />
      )}
    </button>
  );
}
