import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface GymFeatures {
  enabledFeatures: Record<string, boolean>;
  subscriptionStatus: string;
  subscriptionExpiry: string | null;
}

interface GymState {
  selectedGymId: string | null;
  gymFeatures: GymFeatures | null;
  setSelectedGymId: (id: string) => void;
  setGymFeatures: (features: GymFeatures) => void;
  clearGymFeatures: () => void;
}

export const useGymStore = create<GymState>()(
  persist(
    (set) => ({
      selectedGymId: null,
      gymFeatures: null,
      setSelectedGymId: (id) => set({ selectedGymId: id }),
      setGymFeatures: (gymFeatures) => set({ gymFeatures }),
      clearGymFeatures: () => set({ gymFeatures: null }),
    }),
    {
      name: "kybergym-selected-gym",
      partialize: (state) => ({
        selectedGymId: state.selectedGymId,
      }),
    }
  )
);
