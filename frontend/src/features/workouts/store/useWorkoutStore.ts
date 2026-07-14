import { create } from "zustand";
import { persist } from "zustand/middleware";
import { WorkoutFilters, WorkoutSortField, SortDir } from "../types";

interface WorkoutState {
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  filters: WorkoutFilters;
  setFilters: (f: Partial<WorkoutFilters>) => void;
  clearFilters: () => void;

  sortField: WorkoutSortField;
  sortDir: SortDir;
  setSort: (field: WorkoutSortField, dir: SortDir) => void;

  viewMode: "card" | "table";
  setViewMode: (mode: "card" | "table") => void;
}

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set) => ({
      searchQuery: "",
      setSearchQuery: (searchQuery) => set({ searchQuery }),

      filters: {},
      setFilters: (f) => set((state) => ({ filters: { ...state.filters, ...f } })),
      clearFilters: () => set({ filters: {} }),

      sortField: "createdAt",
      sortDir: "desc",
      setSort: (sortField, sortDir) => set({ sortField, sortDir }),

      viewMode: "card",
      setViewMode: (viewMode) => set({ viewMode }),
    }),
    {
      name: "kybergym-workouts-prefs",
      partialize: (state) => ({
        sortField: state.sortField,
        sortDir: state.sortDir,
        viewMode: state.viewMode,
      }),
    },
  ),
);
