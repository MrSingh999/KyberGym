import { create } from "zustand";

interface MembersFilters {
  status: string[];
  plan: string[];
  gender: string[];
}

interface MemberDirectoryState {
  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Filters
  filters: MembersFilters;
  setFilters: (filters: Partial<MembersFilters>) => void;
  clearFilters: () => void;
  
  // View Mode
  viewMode: "card" | "table";
  setViewMode: (mode: "card" | "table") => void;
}

export const useMemberDirectoryStore = create<MemberDirectoryState>((set) => ({
  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  filters: {
    status: [],
    plan: [],
    gender: [],
  },
  setFilters: (newFilters) => set((state) => ({ 
    filters: { ...state.filters, ...newFilters } 
  })),
  clearFilters: () => set({ filters: { status: [], plan: [], gender: [] } }),
  
  // Default to table for desktop, but mobile will ignore this and force card mode
  viewMode: "table",
  setViewMode: (viewMode) => set({ viewMode }),
}));
