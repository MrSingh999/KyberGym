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
    <div className="space-y-2 sm:space-y-3">
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        <PaymentsSearch value={searchQuery} onChange={setSearchQuery} className="flex-1 min-w-0 sm:min-w-[200px]" />

        {/* Filter - mobile sheet */}
        <button
          onClick={() => setFilterSheetOpen(true)}
          className={cn(
            'lg:hidden flex items-center gap-2 px-3 sm:px-3.5 py-2.5 text-sm font-medium rounded-xl border transition-colors',
            activeFiltersCount > 0
              ? 'border-border-default text-text-primary bg-surface'
              : 'border-border-default text-text-muted hover:text-text-primary hover:border-border-hover bg-surface',
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

        {/* Filter - desktop popover */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              className={cn(
                'hidden lg:flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium rounded-xl border transition-colors cursor-pointer',
                activeFiltersCount > 0
                  ? 'border-border-default text-text-primary bg-surface'
                  : 'border-border-default text-text-muted hover:text-text-primary hover:border-border-hover bg-surface',
              )}
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" sideOffset={8} className="w-80 p-5 bg-surface border-border-default">
            <FiltersContent />
          </PopoverContent>
        </Popover>

        {/* Sort */}
        <div className="relative" ref={sortRef}>
          <button
            onClick={() => setSortOpen(!sortOpen)}
            className="flex items-center gap-2 px-3 sm:px-3.5 py-2.5 text-sm font-medium rounded-xl border border-border-default bg-surface text-text-muted hover:text-text-primary hover:border-border-hover transition-colors cursor-pointer select-none"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">{currentSort}</span>
            <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', sortOpen && 'rotate-180')} />
          </button>
          {sortOpen && (
            <div className="absolute right-0 top-11 z-20 bg-surface border border-border-default rounded-xl shadow-lg py-1.5 w-40 sm:w-44 text-xs sm:text-sm">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={`${opt.field}-${opt.dir}`}
                  onClick={() => { setSort(opt.field, opt.dir); setSortOpen(false); }}
                  className={cn(
                    'w-full text-left px-3 py-2 hover:bg-surface-hover transition-colors',
                    opt.field === sortField && opt.dir === sortDir ? 'text-text-primary font-semibold' : 'text-text-secondary',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* View toggle */}
        <div className="hidden sm:flex items-center gap-1 p-1 bg-surface-hover rounded-xl border border-border-default">
          {(['card', 'table'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={cn(
                'p-1.5 rounded-lg transition-colors',
                viewMode === mode ? 'bg-surface text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary',
              )}
              title={`${mode} view`}
            >
              {mode === 'card' ? <LayoutList className="w-4 h-4" /> : <Table2 className="w-4 h-4" />}
            </button>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate('/admin/member-payments/collect')}
          className="flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-primary text-primary-foreground text-xs sm:text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-sm whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Collect Payment</span>
        </button>
      </div>

      {/* Mobile collect button */}
      <button
        onClick={() => navigate('/admin/member-payments/collect')}
        className="flex sm:hidden items-center justify-center gap-2 w-full py-3 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-sm"
      >
        <Plus className="w-4 h-4" />
        <span>Collect Payment</span>
      </button>

      {totalCount > 0 && (
        <p className="text-xs text-text-muted">
          {totalCount} payment{totalCount !== 1 ? 's' : ''}
          {searchQuery && ` matching "${searchQuery}"`}
        </p>
      )}
    </div>
  );
}
