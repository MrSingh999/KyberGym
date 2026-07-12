import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SidebarState {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  setCollapsed: (collapsed: boolean) => void;
  
  isMobileDrawerOpen: boolean;
  setMobileDrawerOpen: (open: boolean) => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isCollapsed: false,
      toggleSidebar: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
      setCollapsed: (collapsed) => set({ isCollapsed: collapsed }),
      
      isMobileDrawerOpen: false,
      setMobileDrawerOpen: (open) => set({ isMobileDrawerOpen: open }),
    }),
    {
      name: "kybergym-sidebar",
      partialize: (state) => ({ isCollapsed: state.isCollapsed }), // Persist only desktop collapse state
    }
  )
);
