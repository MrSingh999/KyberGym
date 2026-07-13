import { useNavigate } from 'react-router';
import { Plus, Filter, SlidersHorizontal, LayoutList, Table2, ChevronDown } from 'lucide-react';
import { usePaymentStore } from '../store/usePaymentStore';
import { PaymentsSearch } from './PaymentsSearch';
import { PaymentSortField, SortDir } from '../types';
import { cn } from '@/lib/utils';

const SORT_OPTIONS: { label: string; field: PaymentSortField; dir: SortDir }[] = [
  { label: 'Newest first', field: 'paymentDate', dir: 'desc' },
  { label: 'Oldest first', field: 'paymentDate', dir: 'asc' },
  { label: 'Amount ↓', field: 'finalAmount', dir: 'desc' },
  { label: 'Amount ↑', field: 'finalAmount', dir: 'asc' },
  { label: 'Member A–Z', field: 'memberName', dir: 'asc' },
];

interface PaymentsToolbarProps {
  totalCount: number;
}

export function PaymentsToolbar({ totalCount }: PaymentsToolbarProps) {
  const navigate = useNavigate();
  const {
    searchQuery, setSearchQuery,
    viewMode, setViewMode,
    sortField, sortDir, setSort,
    setFilterSheetOpen,
    filters,
  } = usePaymentStore();

  const activeFiltersCount =
    filters.status.length + filters.method.length +
    (filters.dateFrom ? 1 : 0) + (filters.dateTo ? 1 : 0);

  const currentSort = SORT_OPTIONS.find(
    (o) => o.field === sortField && o.dir === sortDir,
  )?.label ?? 'Sort';

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        <PaymentsSearch value={searchQuery} onChange={setSearchQuery} className="flex-1" />

        {/* Filter */}
        <button
          onClick={() => setFilterSheetOpen(true)}
          className={cn(
            'flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium rounded-xl border transition-colors',
            activeFiltersCount > 0
              ? 'border-primary text-primary bg-primary/5'
              : 'border-default text-muted hover:text-primary hover:border-hover bg-surface',
          )}
        >
          <Filter className="w-4 h-4" />
          <span className="hidden sm:inline">Filters</span>
          {activeFiltersCount > 0 && (
            <span className="bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {/* Sort */}
        <details className="relative">
          <summary className="list-none flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium rounded-xl border border-default bg-surface text-muted hover:text-primary hover:border-hover transition-colors cursor-pointer select-none">
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">{currentSort}</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </summary>
          <div className="absolute right-0 top-11 z-20 bg-surface border border-default rounded-xl shadow-lg py-1.5 w-44 text-sm">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={`${opt.field}-${opt.dir}`}
                onClick={() => setSort(opt.field, opt.dir)}
                className={cn(
                  'w-full text-left px-3 py-2 hover:bg-surface-hover transition-colors',
                  opt.field === sortField && opt.dir === sortDir ? 'text-primary font-semibold' : 'text-secondary',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </details>

        {/* View toggle */}
        <div className="hidden sm:flex items-center gap-1 p-1 bg-surface-hover rounded-xl border border-default">
          {(['card', 'table'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={cn(
                'p-1.5 rounded-lg transition-colors',
                viewMode === mode ? 'bg-surface text-primary shadow-sm' : 'text-muted hover:text-primary',
              )}
              title={`${mode} view`}
            >
              {mode === 'card' ? <LayoutList className="w-4 h-4" /> : <Table2 className="w-4 h-4" />}
            </button>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate('/admin/payments/collect')}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-sm whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Collect Payment</span>
        </button>
      </div>

      {totalCount > 0 && (
        <p className="text-xs text-muted">
          {totalCount} payment{totalCount !== 1 ? 's' : ''}
          {searchQuery && ` matching "${searchQuery}"`}
        </p>
      )}
    </div>
  );
}
