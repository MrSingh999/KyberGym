import { create } from "zustand";
import { persist } from "zustand/middleware";

interface GymState {
  selectedGymId: string | null;
  setSelectedGymId: (id: string) => void;
}

export const useGymStore = create<GymState>()(
  persist(
    (set) => ({
      selectedGymId: null,
      setSelectedGymId: (id) => set({ selectedGymId: id }),
    }),
    {
      name: "kybergym-selected-gym",
    }
  )
);
