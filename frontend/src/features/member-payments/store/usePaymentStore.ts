import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PaymentsFilters, PaymentSortField, SortDir } from '../types';

interface PaymentsState {
  // ─── Search ───────────────────────────────────────────────────────────────
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // ─── Filters ──────────────────────────────────────────────────────────────
  filters: PaymentsFilters;
  setFilters: (f: Partial<PaymentsFilters>) => void;
  clearFilters: () => void;
  isFilterSheetOpen: boolean;
  setFilterSheetOpen: (v: boolean) => void;

  // ─── Sorting (persisted) ──────────────────────────────────────────────────
  sortField: PaymentSortField;
  sortDir: SortDir;
  setSort: (field: PaymentSortField, dir: SortDir) => void;

  // ─── View & Grouping Mode (persisted) ──────────────────────────────────
  viewMode: 'card' | 'table';
  setViewMode: (mode: 'card' | 'table') => void;
  groupMode: 'grouped' | 'transactions';
  setGroupMode: (mode: 'grouped' | 'transactions') => void;

  // ─── Row Selection ────────────────────────────────────────────────────────
  selectedRows: Record<string, boolean>;
  setSelectedRows: (rows: Record<string, boolean>) => void;
  clearSelection: () => void;
}

const DEFAULT_FILTERS: PaymentsFilters = {
  status: [],
  method: [],
  dateFrom: undefined,
  dateTo: undefined,
  planId: undefined,
};

export const usePaymentStore = create<PaymentsState>()(
  persist(
    (set) => ({
      // Search
      searchQuery: '',
      setSearchQuery: (searchQuery) => set({ searchQuery }),

      // Filters
      filters: DEFAULT_FILTERS,
      setFilters: (f) =>
        set((state) => ({ filters: { ...state.filters, ...f } })),
      clearFilters: () => set({ filters: DEFAULT_FILTERS }),
      isFilterSheetOpen: false,
      setFilterSheetOpen: (isFilterSheetOpen) => set({ isFilterSheetOpen }),

      // Sorting
      sortField: 'paymentDate',
      sortDir: 'desc',
      setSort: (sortField, sortDir) => set({ sortField, sortDir }),

      // View & Group Mode
      viewMode: 'card',
      setViewMode: (viewMode) => set({ viewMode }),
      groupMode: 'grouped',
      setGroupMode: (groupMode) => set({ groupMode }),

      // Selection
      selectedRows: {},
      setSelectedRows: (selectedRows) => set({ selectedRows }),
      clearSelection: () => set({ selectedRows: {} }),
    }),
    {
      name: 'kybergym-member-payments-prefs',
      // Only persist user preferences, not transient UI
      partialize: (state) => ({
        sortField: state.sortField,
        sortDir: state.sortDir,
        viewMode: state.viewMode,
        groupMode: state.groupMode,
      }),
    },
  ),
);
