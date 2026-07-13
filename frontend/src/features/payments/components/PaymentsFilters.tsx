import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { usePaymentStore } from '../store/usePaymentStore';
import { PaymentStatus, PaymentMethod, PAYMENT_STATUS_LABELS, PAYMENT_METHOD_LABELS } from '../types';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

const STATUS_OPTIONS = Object.keys(PAYMENT_STATUS_LABELS) as PaymentStatus[];
const METHOD_OPTIONS = Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[];

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
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
  const { filters, setFilters, clearFilters } = usePaymentStore();

  const toggleStatus = (v: PaymentStatus) => {
    setFilters({
      status: filters.status.includes(v) ? filters.status.filter((s) => s !== v) : [...filters.status, v],
    });
  };

  const toggleMethod = (v: PaymentMethod) => {
    setFilters({
      method: filters.method.includes(v) ? filters.method.filter((m) => m !== v) : [...filters.method, v],
    });
  };

  const hasFilters = filters.status.length > 0 || filters.method.length > 0 || filters.dateFrom || filters.dateTo;

  return (
    <div className="space-y-6">
      <FilterSection title="Status">
        {STATUS_OPTIONS.map((s) => (
          <FilterChip key={s} label={PAYMENT_STATUS_LABELS[s]} active={filters.status.includes(s)} onClick={() => toggleStatus(s)} />
        ))}
      </FilterSection>

      <FilterSection title="Payment Method">
        {METHOD_OPTIONS.map((m) => (
          <FilterChip key={m} label={PAYMENT_METHOD_LABELS[m]} active={filters.method.includes(m)} onClick={() => toggleMethod(m)} />
        ))}
      </FilterSection>

      <FilterSection title="Date Range">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] text-muted uppercase font-semibold mb-1 block">From</label>
            <Input type="date" value={filters.dateFrom || ''} onChange={(e) => setFilters({ dateFrom: e.target.value || undefined })} className="h-9 text-xs" />
          </div>
          <div>
            <label className="text-[10px] text-muted uppercase font-semibold mb-1 block">To</label>
            <Input type="date" value={filters.dateTo || ''} onChange={(e) => setFilters({ dateTo: e.target.value || undefined })} className="h-9 text-xs" />
          </div>
        </div>
      </FilterSection>

      {hasFilters && (
        <button onClick={clearFilters} className="text-xs text-destructive hover:underline flex items-center gap-1">
          <X className="w-3 h-3" /> Clear all filters
        </button>
      )}
    </div>
  );
}

export function PaymentsFiltersSidebar() {
  return (
    <aside className="w-64 flex-shrink-0 hidden lg:block">
      <div className="sticky top-24 bg-surface border border-default rounded-2xl p-5 shadow-sm">
        <h3 className="font-heading font-semibold text-sm text-primary mb-6">Filters</h3>
        <FiltersContent />
      </div>
    </aside>
  );
}

export function PaymentsFiltersSheet() {
  const { isFilterSheetOpen, setFilterSheetOpen } = usePaymentStore();

  return (
    <AnimatePresence>
      {isFilterSheetOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setFilterSheetOpen(false)}
          />
          <motion.div
            key="sheet"
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed bottom-0 inset-x-0 z-50 bg-surface rounded-t-3xl shadow-xl p-6 pb-safe-area-inset-bottom lg:hidden max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading font-semibold text-base text-primary">Filters</h3>
              <button onClick={() => setFilterSheetOpen(false)} className="p-1.5 rounded-full hover:bg-surface-hover text-muted">
                <X className="w-5 h-5" />
              </button>
            </div>
            <FiltersContent />
            <button onClick={() => setFilterSheetOpen(false)} className="mt-6 w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm">
              Apply Filters
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
