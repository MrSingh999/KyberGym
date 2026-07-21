import { useNavigate } from 'react-router';
import { Plus, Filter, SlidersHorizontal, LayoutGrid, Table2, ChevronDown } from 'lucide-react';
import { usePlanStore } from '../store/usePlanStore';
import { PlansSearch } from './PlansSearch';
import { SortField, SortDir } from '../types';
import { cn } from '@/lib/utils';

const SORT_OPTIONS: { label: string; field: SortField; dir: SortDir }[] = [
  { label: 'Newest', field: 'createdAt', dir: 'desc' },
  { label: 'Oldest', field: 'createdAt', dir: 'asc' },
  { label: 'Name A–Z', field: 'name', dir: 'asc' },
  { label: 'Name Z–A', field: 'name', dir: 'desc' },
  { label: 'Price ↑', field: 'price', dir: 'asc' },
  { label: 'Price ↓', field: 'price', dir: 'desc' },
];

interface PlansToolbarProps {
  totalCount: number;
}

export function PlansToolbar({ totalCount }: PlansToolbarProps) {
  const navigate = useNavigate();
  const {
    searchQuery, setSearchQuery,
    viewMode, setViewMode,
    sortField, sortDir, setSort,
    setFilterSheetOpen,
    filters,
  } = usePlanStore();

  const activeFiltersCount = filters.status.length + filters.durationType.length +
    (filters.isPopular ? 1 : 0) + (filters.isDefault ? 1 : 0);

  const currentSortLabel = SORT_OPTIONS.find(
    (o) => o.field === sortField && o.dir === sortDir,
  )?.label ?? 'Sort';

  return (
    <div className="space-y-3">
      {/* Row 1: Search + Action buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <PlansSearch
          value={searchQuery}
          onChange={setSearchQuery}
          className="flex-1 w-full"
        />

        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar shrink-0">
          {/* Filter button */}
          <button
            onClick={() => setFilterSheetOpen(true)}
            className={cn(
              'flex items-center justify-center gap-2 px-3.5 h-11 sm:h-10 text-xs font-mono font-bold rounded-xl border transition-all cursor-pointer min-h-[44px] sm:min-h-[40px] touch-target',
              activeFiltersCount > 0
                ? 'border-primary text-primary-foreground bg-primary shadow-xs'
                : 'border-border-default/80 text-text-secondary hover:text-text-primary hover:border-border-hover bg-surface/80',
            )}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="bg-primary-foreground text-primary text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center font-mono">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Sort dropdown */}
          <details className="relative">
            <summary className="list-none flex items-center justify-center gap-2 px-3.5 h-11 sm:h-10 text-xs font-mono font-bold rounded-xl border border-border-default/80 bg-surface/80 text-text-secondary hover:text-text-primary hover:border-border-hover transition-colors cursor-pointer select-none min-h-[44px] sm:min-h-[40px] touch-target">
              <SlidersHorizontal className="w-4 h-4" />
              <span>{currentSortLabel}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </summary>
            <div className="absolute right-0 top-12 z-30 bg-surface/95 backdrop-blur-md border border-border-default/80 rounded-xl shadow-lg py-1.5 w-44 text-xs font-mono">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={`${opt.field}-${opt.dir}`}
                  onClick={() => setSort(opt.field, opt.dir)}
                  className={cn(
                    'w-full text-left px-3.5 py-2.5 hover:bg-surface-hover transition-colors cursor-pointer min-h-[44px] sm:min-h-0 flex items-center',
                    opt.field === sortField && opt.dir === sortDir
                      ? 'text-primary font-bold bg-primary/10'
                      : 'text-text-secondary',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </details>

          {/* View mode toggle */}
          <div className="hidden sm:flex items-center gap-1 p-1 bg-surface-hover/60 rounded-xl border border-border-default/80">
            <button
              onClick={() => setViewMode('card')}
              className={cn(
                'p-2 rounded-lg transition-colors cursor-pointer touch-target',
                viewMode === 'card' ? 'bg-surface text-text-primary shadow-xs' : 'text-text-muted hover:text-text-primary',
              )}
              title="Card view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                'p-2 rounded-lg transition-colors cursor-pointer touch-target',
                viewMode === 'table' ? 'bg-surface text-text-primary shadow-xs' : 'text-text-muted hover:text-text-primary',
              )}
              title="Table view"
            >
              <Table2 className="w-4 h-4" />
            </button>
          </div>

          {/* New Plan CTA */}
          <button
            onClick={() => navigate('/admin/plans/new')}
            className="flex items-center justify-center gap-2 px-4 h-11 sm:h-10 bg-primary text-primary-foreground text-xs font-mono font-bold rounded-xl hover:opacity-90 transition-all shadow-xs whitespace-nowrap cursor-pointer min-h-[44px] sm:min-h-[40px] touch-target active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Plan</span>
          </button>
        </div>
      </div>

      {/* Row 2: result count */}
      {totalCount > 0 && (
        <p className="text-xs text-text-muted font-mono px-1">
          Showing {totalCount} plan{totalCount !== 1 ? 's' : ''}
          {searchQuery && ` matching "${searchQuery}"`}
        </p>
      )}
    </div>
  );
}
