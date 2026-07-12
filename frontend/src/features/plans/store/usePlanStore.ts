import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PlansFilters, SortDir, SortField } from '../types';

interface PlansState {
  // ─── Search ───────────────────────────────────────────────────────────────
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // ─── Filters ──────────────────────────────────────────────────────────────
  filters: PlansFilters;
  setFilters: (f: Partial<PlansFilters>) => void;
  clearFilters: () => void;
  isFilterSheetOpen: boolean;
  setFilterSheetOpen: (v: boolean) => void;

  // ─── Sorting (persisted) ──────────────────────────────────────────────────
  sortField: SortField;
  sortDir: SortDir;
  setSort: (field: SortField, dir: SortDir) => void;

  // ─── View Mode (persisted) ────────────────────────────────────────────────
  viewMode: 'card' | 'table';
  setViewMode: (mode: 'card' | 'table') => void;

  // ─── Row Selection ────────────────────────────────────────────────────────
  selectedRows: string[];
  setSelectedRows: (ids: string[]) => void;
  clearSelection: () => void;
}

const DEFAULT_FILTERS: PlansFilters = {
  status: [],
  durationType: [],
  priceMin: undefined,
  priceMax: undefined,
  isPopular: false,
  isDefault: false,
};

export const usePlanStore = create<PlansState>()(
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
      sortField: 'createdAt',
      sortDir: 'desc',
      setSort: (sortField, sortDir) => set({ sortField, sortDir }),

      // View Mode
      viewMode: 'card',
      setViewMode: (viewMode) => set({ viewMode }),

      // Selection (never persisted — reset on mount)
      selectedRows: [],
      setSelectedRows: (selectedRows) => set({ selectedRows }),
      clearSelection: () => set({ selectedRows: [] }),
    }),
    {
      name: 'kybergym-plans-prefs',
      // Only persist user preferences, not transient UI state
      partialize: (state) => ({
        sortField: state.sortField,
        sortDir: state.sortDir,
        viewMode: state.viewMode,
      }),
    },
  ),
);
