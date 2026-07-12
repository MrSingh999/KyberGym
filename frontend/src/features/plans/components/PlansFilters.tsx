import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { usePlanStore } from '../store/usePlanStore';
import { DurationType, PlanStatus } from '../types';
import { cn } from '../../../../lib/utils';

const STATUS_OPTIONS: { value: PlanStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'archived', label: 'Archived' },
];

const DURATION_OPTIONS: { value: DurationType; label: string }[] = [
  { value: 'days', label: 'Days' },
  { value: 'weeks', label: 'Weeks' },
  { value: 'months', label: 'Months' },
  { value: 'years', label: 'Years' },
];

function FilterChip<T extends string>({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
        active
          ? 'bg-primary text-primary-foreground border-primary'
          : 'bg-surface border-default text-secondary hover:border-hover hover:text-primary',
      )}
    >
      {label}
    </button>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2.5">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted">{title}</h4>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function FiltersContent() {
  const { filters, setFilters, clearFilters } = usePlanStore();

  const toggleStatus = (v: PlanStatus) => {
    setFilters({
      status: filters.status.includes(v)
        ? filters.status.filter((s) => s !== v)
        : [...filters.status, v],
    });
  };

  const toggleDuration = (v: DurationType) => {
    setFilters({
      durationType: filters.durationType.includes(v)
        ? filters.durationType.filter((d) => d !== v)
        : [...filters.durationType, v],
    });
  };

  const hasFilters =
    filters.status.length > 0 ||
    filters.durationType.length > 0 ||
    filters.isPopular ||
    filters.isDefault;

  return (
    <div className="space-y-6">
      <FilterSection title="Status">
        {STATUS_OPTIONS.map((o) => (
          <FilterChip
            key={o.value}
            label={o.label}
            active={filters.status.includes(o.value)}
            onClick={() => toggleStatus(o.value)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Duration Type">
        {DURATION_OPTIONS.map((o) => (
          <FilterChip
            key={o.value}
            label={o.label}
            active={filters.durationType.includes(o.value)}
            onClick={() => toggleDuration(o.value)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Plan Type">
        <FilterChip
          label="⭐ Popular only"
          active={filters.isPopular}
          onClick={() => setFilters({ isPopular: !filters.isPopular })}
        />
        <FilterChip
          label="Default plan"
          active={filters.isDefault}
          onClick={() => setFilters({ isDefault: !filters.isDefault })}
        />
      </FilterSection>

      {hasFilters && (
        <button
          onClick={clearFilters}
          className="text-xs text-destructive hover:underline flex items-center gap-1"
        >
          <X className="w-3 h-3" /> Clear all filters
        </button>
      )}
    </div>
  );
}

// ─── Desktop sidebar panel ────────────────────────────────────────────────────

export function PlansFiltersSidebar() {
  return (
    <aside className="w-56 flex-shrink-0 hidden lg:block">
      <div className="sticky top-24 bg-surface border border-default rounded-2xl p-5 space-y-6 shadow-sm">
        <h3 className="font-heading font-semibold text-sm text-primary">Filters</h3>
        <FiltersContent />
      </div>
    </aside>
  );
}

// ─── Mobile bottom sheet ──────────────────────────────────────────────────────

export function PlansFiltersSheet() {
  const { isFilterSheetOpen, setFilterSheetOpen } = usePlanStore();

  return (
    <AnimatePresence>
      {isFilterSheetOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setFilterSheetOpen(false)}
          />
          <motion.div
            key="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed bottom-0 inset-x-0 z-50 bg-surface rounded-t-3xl shadow-xl p-6 pb-safe-area-inset-bottom lg:hidden max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading font-semibold text-base text-primary">Filters</h3>
              <button
                onClick={() => setFilterSheetOpen(false)}
                className="p-1.5 rounded-full hover:bg-surface-hover text-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <FiltersContent />
            <button
              onClick={() => setFilterSheetOpen(false)}
              className="mt-6 w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm"
            >
              Apply Filters
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
