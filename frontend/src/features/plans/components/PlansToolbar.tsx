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
      <div className="flex items-center gap-3 flex-wrap">
        <PlansSearch
          value={searchQuery}
          onChange={setSearchQuery}
          className="flex-1"
        />

        {/* Filter button */}
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

        {/* Sort dropdown */}
        <details className="relative">
          <summary className="list-none flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium rounded-xl border border-default bg-surface text-muted hover:text-primary hover:border-hover transition-colors cursor-pointer select-none">
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">{currentSortLabel}</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </summary>
          <div className="absolute right-0 top-11 z-20 bg-surface border border-default rounded-xl shadow-lg py-1.5 w-44 text-sm">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={`${opt.field}-${opt.dir}`}
                onClick={() => setSort(opt.field, opt.dir)}
                className={cn(
                  'w-full text-left px-3 py-2 hover:bg-surface-hover transition-colors',
                  opt.field === sortField && opt.dir === sortDir
                    ? 'text-primary font-semibold'
                    : 'text-secondary',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </details>

        {/* View mode toggle */}
        <div className="hidden sm:flex items-center gap-1 p-1 bg-surface-hover rounded-xl border border-default">
          <button
            onClick={() => setViewMode('card')}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              viewMode === 'card' ? 'bg-surface text-primary shadow-sm' : 'text-muted hover:text-primary',
            )}
            title="Card view"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              viewMode === 'table' ? 'bg-surface text-primary shadow-sm' : 'text-muted hover:text-primary',
            )}
            title="Table view"
          >
            <Table2 className="w-4 h-4" />
          </button>
        </div>

        {/* New Plan CTA */}
        <button
          onClick={() => navigate('/admin/plans/new')}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-sm whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>New Plan</span>
        </button>
      </div>

      {/* Row 2: result count */}
      {totalCount > 0 && (
        <p className="text-xs text-muted">
          {totalCount} plan{totalCount !== 1 ? 's' : ''}
          {searchQuery && ` matching "${searchQuery}"`}
        </p>
      )}
    </div>
  );
}
