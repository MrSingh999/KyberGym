import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AssignmentFilters } from "../types";

interface WorkoutAssignmentState {
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  filters: AssignmentFilters;
  setFilters: (f: Partial<AssignmentFilters>) => void;
  clearFilters: () => void;

  viewMode: "card" | "table";
  setViewMode: (mode: "card" | "table") => void;
}

export const useWorkoutAssignmentStore = create<WorkoutAssignmentState>()(
  persist(
    (set) => ({
      searchQuery: "",
      setSearchQuery: (searchQuery) => set({ searchQuery }),

      filters: {},
      setFilters: (f) => set((state) => ({ filters: { ...state.filters, ...f } })),
      clearFilters: () => set({ filters: {} }),

      viewMode: "table",
      setViewMode: (viewMode) => set({ viewMode }),
    }),
    {
      name: "kybergym-workout-assignments-prefs",
      partialize: (state) => ({ viewMode: state.viewMode }),
    },
  ),
);
