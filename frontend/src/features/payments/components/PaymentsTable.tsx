import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  OnChangeFn,
} from '@tanstack/react-table';
import { useNavigate } from 'react-router';
import { ArrowUpDown, ArrowUp, ArrowDown, Eye, Printer, MoreVertical } from 'lucide-react';
import { PaymentListItem } from '../types';
import { PaymentStatusBadge } from './PaymentStatusBadge';
import { PaymentMethodIcon } from './PaymentMethodIcon';
import { cn } from '@/lib/utils';

interface PaymentsTableProps {
  data: PaymentListItem[];
  rowSelection: Record<string, boolean>;
  onRowSelectionChange: OnChangeFn<Record<string, boolean>>;
  sorting: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
}

export function PaymentsTable({
  data,
  rowSelection,
  onRowSelectionChange,
  sorting,
  onSortingChange,
}: PaymentsTableProps) {
  const navigate = useNavigate();

  const columns: ColumnDef<PaymentListItem>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
          className="rounded border-border-default w-4 h-4 accent-primary cursor-pointer"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          onClick={(e) => e.stopPropagation()}
          className="rounded border-border-default w-4 h-4 accent-primary cursor-pointer"
        />
      ),
      size: 40,
    },
    {
      accessorKey: 'memberName',
      header: ({ column }) => <SortHeader label="Member" column={column} />,
      cell: ({ row }) => (
        <div>
          <span className="font-medium text-text-primary">{row.original.memberName}</span>
          <p className="text-xs text-text-muted mt-0.5">{row.original.id}</p>
        </div>
      ),
    },
    {
      accessorKey: 'planName',
      header: 'Plan',
      cell: ({ getValue }) => <span className="text-text-secondary">{getValue<string>()}</span>,
    },
    {
      accessorKey: 'finalAmount',
      header: ({ column }) => <SortHeader label="Amount" column={column} />,
      cell: ({ getValue }) => <span className="font-semibold text-text-primary tabular-nums">₹{getValue<number>()}</span>,
    },
    {
      accessorKey: 'paymentMethod',
      header: 'Method',
      cell: ({ getValue }) => <PaymentMethodIcon method={getValue<PaymentListItem['paymentMethod']>()} />,
    },
    {
      accessorKey: 'paymentStatus',
      header: 'Status',
      cell: ({ getValue }) => <PaymentStatusBadge status={getValue<PaymentListItem['paymentStatus']>()} />,
    },
    {
      accessorKey: 'paymentDate',
      header: ({ column }) => <SortHeader label="Date" column={column} />,
      cell: ({ getValue }) => (
        <span className="text-text-secondary whitespace-nowrap">
          {new Date(getValue<string>()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div onClick={(e) => e.stopPropagation()}>
          <details className="relative group">
            <summary className="list-none p-1.5 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text-primary cursor-pointer">
              <MoreVertical className="w-4 h-4" />
            </summary>
            <div className="absolute right-0 bottom-full mb-1 z-20 bg-surface border border-border-default rounded-xl shadow-lg py-1.5 w-36 text-sm">
              <button
                onClick={() => navigate(`/admin/payments/${row.original.id}`)}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-surface-hover text-text-primary transition-colors"
              >
                <Eye className="w-3.5 h-3.5" /> View Details
              </button>
              <button
                onClick={() => window.print()}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-surface-hover text-text-primary transition-colors"
              >
                <Printer className="w-3.5 h-3.5" /> Print Receipt
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
    state: { rowSelection, sorting },
    onRowSelectionChange,
    onSortingChange,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
    manualSorting: true,
  });

  return (
    <div className="rounded-xl border border-border-default overflow-hidden bg-surface shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-border-default bg-surface-hover">
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    style={{ width: header.getSize() }}
                    className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide"
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
                onClick={() => navigate(`/admin/payments/${row.original.id}`)}
                className={cn(
                  'border-b border-border-default hover:bg-surface-hover transition-colors cursor-pointer',
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

function SortHeader({ label, column }: { label: string; column: any }) {
  const sorted = column.getIsSorted();
  return (
    <button
      onClick={column.getToggleSortingHandler()}
      className="flex items-center gap-1.5 hover:text-text-primary transition-colors group"
    >
      {label}
      {sorted === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-text-primary" /> :
       sorted === 'desc' ? <ArrowDown className="w-3.5 h-3.5 text-text-primary" /> :
       <ArrowUpDown className="w-3.5 h-3.5 opacity-30 group-hover:opacity-70 transition-opacity" />}
    </button>
  );
}
