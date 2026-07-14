import { useState } from 'react';
import { SortingState } from '@tanstack/react-table';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { usePlans, useDuplicatePlan, useArchivePlan, useSetPlanStatus } from '../hooks/usePlans';
import { usePlanStore } from '../store/usePlanStore';
import { PlansToolbar } from '../components/PlansToolbar';
import { PlansFiltersSidebar, PlansFiltersSheet } from '../components/PlansFilters';
import { PlanCard } from '../components/PlanCard';
import { PlansTable } from '../components/PlansTable';
import { PlansSkeleton } from '../components/PlansSkeleton';
import { EmptyPlansState } from '../components/EmptyPlansState';
import { BulkActionBar } from '../components/BulkActionBar';

export function PlansPage() {
  const {
    searchQuery, filters, sortField, sortDir, viewMode,
    selectedRows, setSelectedRows, clearSelection,
  } = usePlanStore();

  // TanStack table sorting state (sync to store on change)
  const [sorting, setSorting] = useState<SortingState>([{ id: sortField, desc: sortDir === 'desc' }]);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  const { data, isLoading } = usePlans({
    search: searchQuery,
    filters,
    sortField,
    sortDir,
    page: 1,
    pageSize: 24,
  });

  const { mutate: duplicate } = useDuplicatePlan();
  const { mutate: archive } = useArchivePlan('');
  const { mutate: setStatus } = useSetPlanStatus();

  const plans = data?.data ?? [];
  const totalCount = data?.total ?? 0;

  const handleDuplicate = (id: string) => {
    duplicate(id, { onSuccess: () => toast.success('Plan duplicated') });
  };
  const handleArchive = (id: string) => {
    toast('Archive this plan?', {
      action: { label: 'Archive', onClick: () => archive(undefined, { onSuccess: () => toast.success('Plan archived') }) },
    });
  };

  const selectedIds = Object.keys(rowSelection).filter((k) => rowSelection[k]);

  const handleBulkActivate = () => {
    selectedIds.forEach((id) => setStatus({ planId: id, status: 'active' }));
    setRowSelection({});
    toast.success(`${selectedIds.length} plan(s) activated`);
  };
  const handleBulkDeactivate = () => {
    selectedIds.forEach((id) => setStatus({ planId: id, status: 'inactive' }));
    setRowSelection({});
    toast.success(`${selectedIds.length} plan(s) deactivated`);
  };
  const handleBulkArchive = () => {
    selectedIds.forEach((id) => setStatus({ planId: id, status: 'archived' }));
    setRowSelection({});
    toast.success(`${selectedIds.length} plan(s) archived`);
  };

  const emptyVariant = searchQuery
    ? 'no-search'
    : filters.status.length || filters.durationType.length || filters.isPopular || filters.isDefault
    ? 'no-filter'
    : 'no-plans';

  return (
    <div className="flex flex-col min-h-full bg-canvas">
      <div className="p-4 sm:p-6 lg:p-8 flex-1 w-full max-w-7xl mx-auto">
        {/* Page heading */}
        <div className="mb-6">
          <h1 className="text-h2 font-heading font-bold text-primary">Membership Plans</h1>
          <p className="text-sm text-muted mt-1">Create and manage membership tiers for your gym.</p>
        </div>

        {/* Toolbar */}
        <div className="mb-6">
          <PlansToolbar totalCount={totalCount} />
        </div>

        {/* Content layout: sidebar + main */}
        <div className="flex gap-6">
          <PlansFiltersSidebar />

          <div className="flex-1 min-w-0">
            {isLoading ? (
              <PlansSkeleton mode={viewMode} />
            ) : plans.length === 0 ? (
              <EmptyPlansState variant={emptyVariant} />
            ) : (
              <>
                {/* Desktop View: table or cards layout depending on viewMode */}
                <div className="hidden lg:block">
                  {viewMode === 'table' ? (
                    <PlansTable
                      data={plans}
                      onDuplicate={handleDuplicate}
                      onArchive={handleArchive}
                      rowSelection={rowSelection}
                      onRowSelectionChange={setRowSelection}
                      sorting={sorting}
                      onSortingChange={setSorting}
                    />
                  ) : (
                    <motion.div
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {plans.map((plan, i) => (
                        <PlanCard
                          key={plan.id}
                          plan={plan}
                          index={i}
                          onDuplicate={handleDuplicate}
                          onArchive={handleArchive}
                        />
                      ))}
                    </motion.div>
                  )}
                </div>

                {/* Mobile View: always display cards layout */}
                <div className="block lg:hidden">
                  <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {plans.map((plan, i) => (
                      <PlanCard
                        key={plan.id}
                        plan={plan}
                        index={i}
                        onDuplicate={handleDuplicate}
                        onArchive={handleArchive}
                      />
                    ))}
                  </motion.div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter sheet */}
      <PlansFiltersSheet />

      {/* Bulk action bar (floats above everything when rows selected) */}
      <BulkActionBar
        selectedCount={selectedIds.length}
        onActivate={handleBulkActivate}
        onDeactivate={handleBulkDeactivate}
        onArchive={handleBulkArchive}
        onClearSelection={() => setRowSelection({})}
      />
    </div>
  );
}
