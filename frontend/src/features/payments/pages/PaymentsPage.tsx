import { useState, useEffect } from 'react';
import { SortingState } from '@tanstack/react-table';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router';
import { usePayments } from '../hooks/usePayments';
import { usePaymentStore } from '../store/usePaymentStore';
import { PaymentsToolbar } from '../components/PaymentsToolbar';
import { PaymentsFiltersSidebar, PaymentsFiltersSheet } from '../components/PaymentsFilters';
import { PaymentCard } from '../components/PaymentCard';
import { PaymentsTable } from '../components/PaymentsTable';
import { PaymentsSkeleton } from '../components/PaymentsSkeleton';
import { EmptyPaymentsState } from '../components/EmptyPaymentsState';
import { BulkActionBar } from '../components/BulkActionBar';

export function PaymentsPage() {
  const [searchParams] = useSearchParams();
  const searchParam = searchParams.get('search');

  const {
    searchQuery, setSearchQuery, filters, sortField, sortDir, viewMode,
    selectedRows, setSelectedRows, clearSelection,
  } = usePaymentStore();

  useEffect(() => {
    if (searchParam !== null) {
      if (searchParam !== searchQuery) {
        setSearchQuery(searchParam);
      }
    }
  }, [searchParam, searchQuery, setSearchQuery]);

  const [sorting, setSorting] = useState<SortingState>([{ id: sortField, desc: sortDir === 'desc' }]);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  const { data, isLoading } = usePayments({
    search: searchQuery,
    filters,
    sortField,
    sortDir,
    page: 1,
    pageSize: 24,
  });

  const payments = data?.data ?? [];
  const totalCount = data?.total ?? 0;

  const selectedIds = Object.keys(rowSelection).filter((k) => rowSelection[k]);

  const handleExport = () => {
    toast.success(`Exporting ${selectedIds.length} payments as CSV...`);
    setRowSelection({});
  };

  const handlePrint = () => {
    toast.success(`Generating receipts for ${selectedIds.length} payments...`);
    setTimeout(() => window.print(), 1000);
    setRowSelection({});
  };

  const emptyVariant = searchQuery
    ? 'no-search'
    : filters.status.length || filters.method.length || filters.dateFrom || filters.dateTo
    ? 'no-filter'
    : 'no-payments';

  return (
    <div className="flex flex-col min-h-full bg-canvas">
      <div className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="font-bold text-xl sm:text-2xl text-text-primary tracking-tight">Payments</h1>
            <p className="text-text-secondary mt-1 text-xs">Manage membership dues and track transaction history.</p>
          </div>
        </div>

        <div className="mb-6">
          <PaymentsToolbar totalCount={totalCount} />
        </div>

        <div className="flex gap-6">
          <PaymentsFiltersSidebar />

          <div className="flex-1 min-w-0">
            {isLoading ? (
              <PaymentsSkeleton mode={viewMode} />
            ) : payments.length === 0 ? (
              <EmptyPaymentsState variant={emptyVariant} />
            ) : (
              <>
                <div className="hidden lg:block">
                  {viewMode === 'table' ? (
                    <PaymentsTable
                      data={payments}
                      rowSelection={rowSelection}
                      onRowSelectionChange={setRowSelection}
                      sorting={sorting}
                      onSortingChange={setSorting}
                    />
                  ) : (
                    <motion.div
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}
                    >
                      {payments.map((payment, i) => (
                        <PaymentCard key={payment.id} payment={payment} index={i} />
                      ))}
                    </motion.div>
                  )}
                </div>

                <div className="block lg:hidden">
                  <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}
                  >
                    {payments.map((payment, i) => (
                      <PaymentCard key={payment.id} payment={payment} index={i} />
                    ))}
                  </motion.div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <PaymentsFiltersSheet />

      <BulkActionBar
        selectedCount={selectedIds.length}
        onExport={handleExport}
        onPrint={handlePrint}
        onClearSelection={() => setRowSelection({})}
      />
    </div>
  );
}
