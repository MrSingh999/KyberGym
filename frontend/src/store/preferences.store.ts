import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PreferencesState {
  tableView: "compact" | "comfortable";
  setTableView: (view: "compact" | "comfortable") => void;
  globalDateRange: { from: Date; to: Date } | null;
  setGlobalDateRange: (range: { from: Date; to: Date } | null) => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      tableView: "comfortable",
      setTableView: (view) => set({ tableView: view }),
      globalDateRange: null,
      setGlobalDateRange: (range) => set({ globalDateRange: range }),
    }),
    {
      name: "kybergym-preferences",
      partialize: (state) => ({ tableView: state.tableView }), // Only persist static prefs
    }
  )
);
