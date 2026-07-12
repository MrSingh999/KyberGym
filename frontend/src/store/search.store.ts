import { create } from "zustand";

interface SearchState {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  toggleOpen: () => void;
  query: string;
  setQuery: (query: string) => void;
}

export const useSearchStore = create<SearchState>()(
  (set) => ({
    isOpen: false,
    setOpen: (open) => set({ isOpen: open }),
    toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
    query: "",
    setQuery: (query) => set({ query }),
  })
);
