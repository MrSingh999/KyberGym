import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Filter, SlidersHorizontal, LayoutList, Table2, ChevronDown } from 'lucide-react';
import { usePaymentStore } from '../store/usePaymentStore';
import { PaymentsSearch } from './PaymentsSearch';
import { PaymentSortField, SortDir } from '../types';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { FiltersContent } from './PaymentsFilters';

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
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const {
    searchQuery, setSearchQuery,
    viewMode, setViewMode,
    groupMode, setGroupMode,
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
    <div className="space-y-3 font-mono">
      {/* Row 1: Category Mode Switcher (By Member vs All Transactions) */}
      <div className="flex items-center justify-between gap-3 flex-wrap border-b border-border-default/60 pb-3">
        <div className="flex items-center gap-1.5 p-1 bg-surface-hover/60 rounded-xl border border-border-default/80 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setGroupMode('grouped')}
            className={cn(
              'flex-1 sm:flex-initial px-3.5 h-10 sm:h-8 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 touch-target',
              groupMode === 'grouped'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-text-secondary hover:text-text-primary',
            )}
          >
            <span>By Member</span>
          </button>
          <button
            type="button"
            onClick={() => setGroupMode('transactions')}
            className={cn(
              'flex-1 sm:flex-initial px-3.5 h-10 sm:h-8 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 touch-target',
              groupMode === 'transactions'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-text-secondary hover:text-text-primary',
            )}
          >
            <span>All Transactions</span>
          </button>
        </div>

        {/* Collect Payment CTA */}
        <button
          onClick={() => navigate('/admin/member-payments/collect')}
          className="flex items-center justify-center gap-2 px-4 h-11 sm:h-10 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:opacity-90 transition-all shadow-xs whitespace-nowrap cursor-pointer min-h-[44px] sm:min-h-[40px] touch-target active:scale-95 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Collect Payment</span>
        </button>
      </div>

      {/* Row 2: Search, Filters, Sort, View mode toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <PaymentsSearch value={searchQuery} onChange={setSearchQuery} className="flex-1 w-full" />

        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar shrink-0">
          {/* Filter - mobile sheet */}
          <button
            onClick={() => setFilterSheetOpen(true)}
            className={cn(
              'lg:hidden flex items-center justify-center gap-2 px-3.5 h-11 sm:h-10 text-xs font-bold rounded-xl border transition-all cursor-pointer min-h-[44px] sm:min-h-[40px] touch-target',
              activeFiltersCount > 0
                ? 'border-primary text-primary-foreground bg-primary shadow-xs'
                : 'border-border-default/80 text-text-secondary hover:text-text-primary bg-surface/80',
            )}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="bg-primary-foreground text-primary text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Filter - desktop popover */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  'hidden lg:flex items-center gap-2 px-3.5 h-10 text-xs font-bold rounded-xl border transition-all cursor-pointer touch-target',
                  activeFiltersCount > 0
                    ? 'border-primary text-primary-foreground bg-primary shadow-xs'
                    : 'border-border-default/80 text-text-secondary hover:text-text-primary bg-surface/80',
                )}
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="bg-primary-foreground text-primary text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" sideOffset={8} className="w-80 p-5 bg-surface/95 backdrop-blur-md border-border-default/80 rounded-2xl shadow-lg font-mono">
              <FiltersContent />
            </PopoverContent>
          </Popover>

          {/* Sort */}
          <div className="relative" ref={sortRef}>
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="flex items-center justify-center gap-2 px-3.5 h-11 sm:h-10 text-xs font-bold rounded-xl border border-border-default/80 bg-surface/80 text-text-secondary hover:text-text-primary hover:border-border-hover transition-colors cursor-pointer select-none min-h-[44px] sm:min-h-[40px] touch-target"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>{currentSort}</span>
              <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', sortOpen && 'rotate-180')} />
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-12 z-30 bg-surface/95 backdrop-blur-md border border-border-default/80 rounded-xl shadow-lg py-1.5 w-44 text-xs font-mono">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={`${opt.field}-${opt.dir}`}
                    onClick={() => { setSort(opt.field, opt.dir); setSortOpen(false); }}
                    className={cn(
                      'w-full text-left px-3 py-2.5 hover:bg-surface-hover transition-colors min-h-[44px] sm:min-h-0 flex items-center',
                      opt.field === sortField && opt.dir === sortDir ? 'text-primary font-bold bg-primary/10' : 'text-text-secondary',
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* View toggle (for Transactions Ledger) */}
          {groupMode === 'transactions' && (
            <div className="hidden sm:flex items-center gap-1 p-1 bg-surface-hover/60 rounded-xl border border-border-default/80">
              {(['card', 'table'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={cn(
                    'p-2 rounded-lg transition-colors cursor-pointer touch-target',
                    viewMode === mode ? 'bg-surface text-text-primary shadow-xs' : 'text-text-muted hover:text-text-primary',
                  )}
                  title={`${mode} view`}
                >
                  {mode === 'card' ? <LayoutList className="w-4 h-4" /> : <Table2 className="w-4 h-4" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {totalCount > 0 && (
        <p className="text-xs text-text-muted font-mono px-1">
          Showing {totalCount} payment record{totalCount !== 1 ? 's' : ''}
          {searchQuery && ` matching "${searchQuery}"`}
        </p>
      )}
    </div>
  );
}
