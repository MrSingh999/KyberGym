import { useState, useEffect, useMemo } from 'react';
import { SortingState } from '@tanstack/react-table';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router';
import { DollarSign, CheckCircle2, Users, Receipt } from 'lucide-react';
import { usePayments } from '../hooks/usePayments';
import { usePaymentStore } from '../store/usePaymentStore';
import { PaymentsToolbar } from '../components/PaymentsToolbar';
import { PaymentsFiltersSheet } from '../components/PaymentsFilters';
import { PaymentCard } from '../components/PaymentCard';
import { MemberPaymentGroupCard, MemberPaymentGroup } from '../components/MemberPaymentGroupCard';
import { PaymentsTable } from '../components/PaymentsTable';
import { PaymentsSkeleton } from '../components/PaymentsSkeleton';
import { EmptyPaymentsState } from '../components/EmptyPaymentsState';
import { BulkActionBar } from '../components/BulkActionBar';

export function MemberPaymentsPage() {
  const [searchParams] = useSearchParams();
  const searchParam = searchParams.get('search');

  const {
    searchQuery, setSearchQuery, filters, sortField, sortDir, viewMode, groupMode,
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
    pageSize: 100,
  });

  const payments = data?.data ?? [];
  const totalCount = data?.total ?? 0;

  // Group payments by Member to eliminate duplicate member cards
  const memberGroups = useMemo(() => {
    const map = new Map<string, MemberPaymentGroup>();

    payments.forEach((p) => {
      const key = p.memberId || p.memberName;
      const existing = map.get(key);

      if (!existing) {
        map.set(key, {
          memberId: p.memberId,
          memberName: p.memberName,
          planName: p.planName,
          totalAmount: p.finalAmount,
          transactionCount: 1,
          latestPaymentDate: p.paymentDate,
          latestStatus: p.paymentStatus,
          latestMethod: p.paymentMethod,
          payments: [p],
        });
      } else {
        existing.totalAmount += p.finalAmount;
        existing.transactionCount += 1;
        existing.payments.push(p);

        // Update latest payment info if p is newer
        if (new Date(p.paymentDate) > new Date(existing.latestPaymentDate)) {
          existing.latestPaymentDate = p.paymentDate;
          existing.latestStatus = p.paymentStatus;
          existing.latestMethod = p.paymentMethod;
          existing.planName = p.planName;
        }
      }
    });

    return Array.from(map.values());
  }, [payments]);

  // Aggregate KPI stats
  const kpiStats = useMemo(() => {
    const totalCollected = payments.reduce((sum, p) => sum + (p.finalAmount || 0), 0);
    const completedCount = payments.filter((p) => p.paymentStatus === 'paid').length;
    const uniqueMembersCount = memberGroups.length;
    const avgAmount = payments.length ? Math.round(totalCollected / payments.length) : 0;

    return { totalCollected, completedCount, uniqueMembersCount, avgAmount };
  }, [payments, memberGroups]);

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
    <div className="flex flex-col min-h-full bg-canvas animate-fade-slide-up">
      <div className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-[1600px] mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
          <div className="min-w-0">
            <h1 className="font-extrabold text-xl sm:text-2xl text-text-primary tracking-tight font-mono">
              Member Payments Console
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary mt-1 font-sans">
              Track revenue collections, categorized member receipts, and billing history.
            </p>
          </div>
        </div>

        {/* KPI Analytics Header Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 font-mono">
          <div className="p-4 rounded-2xl bg-surface/80 backdrop-blur-xs border border-border-default/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Total Revenue</p>
              <p className="text-base sm:text-lg font-extrabold text-text-primary tabular-nums truncate">
                ₹{kpiStats.totalCollected.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface/80 backdrop-blur-xs border border-border-default/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Completed</p>
              <p className="text-base sm:text-lg font-extrabold text-text-primary tabular-nums truncate">
                {kpiStats.completedCount} Payments
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface/80 backdrop-blur-xs border border-border-default/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Paying Members</p>
              <p className="text-base sm:text-lg font-extrabold text-text-primary tabular-nums truncate">
                {kpiStats.uniqueMembersCount} Members
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface/80 backdrop-blur-xs border border-border-default/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20 flex items-center justify-center shrink-0">
              <Receipt className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Avg Transaction</p>
              <p className="text-base sm:text-lg font-extrabold text-text-primary tabular-nums truncate">
                ₹{kpiStats.avgAmount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Toolbar & Filter Bar */}
        <div className="bg-surface/80 backdrop-blur-xs border border-border-default/80 rounded-2xl p-4 sm:p-5 shadow-xs">
          <PaymentsToolbar totalCount={groupMode === 'grouped' ? memberGroups.length : totalCount} />
        </div>

        {/* Content Area */}
        <div className="flex gap-6">
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <PaymentsSkeleton mode={viewMode} />
            ) : payments.length === 0 ? (
              <EmptyPaymentsState variant={emptyVariant} />
            ) : groupMode === 'grouped' ? (
              /* Grouped by Member View - Each Member renders ONCE */
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {memberGroups.map((group, i) => (
                  <MemberPaymentGroupCard key={group.memberId || group.memberName} group={group} index={i} />
                ))}
              </motion.div>
            ) : (
              /* Transactions Ledger View */
              <>
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
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {payments.map((payment, i) => (
                      <PaymentCard key={payment.id} payment={payment} index={i} />
                    ))}
                  </motion.div>
                )}
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
