import { create } from "zustand";
import { AttendanceStatus, AttendancePeriod } from "../types";

interface AttendanceState {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: AttendanceStatus | "all";
  setStatusFilter: (status: AttendanceStatus | "all") => void;
  periodFilter: AttendancePeriod | "all";
  setPeriodFilter: (period: AttendancePeriod | "all") => void;
  dateFilter: string;
  setDateFilter: (date: string) => void;
  clearFilters: () => void;
}

export const useAttendanceStore = create<AttendanceState>((set) => ({
  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),
  statusFilter: "all",
  setStatusFilter: (status) => set({ statusFilter: status }),
  periodFilter: "all",
  setPeriodFilter: (period) => set({ periodFilter: period }),
  dateFilter: "",
  setDateFilter: (date) => set({ dateFilter: date }),
  clearFilters: () =>
    set({
      searchQuery: "",
      statusFilter: "all",
      periodFilter: "all",
      dateFilter: "",
    }),
}));
