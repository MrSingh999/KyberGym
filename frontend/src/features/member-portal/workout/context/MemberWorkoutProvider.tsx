import { createContext, ReactNode } from "react";
import { useMemberWorkout } from "../hooks/useMemberWorkout";
import type { MemberWorkoutItem } from "../types/workout.types";

export interface MemberWorkoutContextType {
  workouts: MemberWorkoutItem[] | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const MemberWorkoutContext = createContext<MemberWorkoutContextType | undefined>(undefined);

interface MemberWorkoutProviderProps {
  children: ReactNode;
}

export function MemberWorkoutProvider({ children }: MemberWorkoutProviderProps) {
  const { workouts, isLoading, error, refetch } = useMemberWorkout();

  const value: MemberWorkoutContextType = {
    workouts,
    isLoading,
    error,
    refetch,
  };

  return (
    <MemberWorkoutContext.Provider value={value}>
      {children}
    </MemberWorkoutContext.Provider>
  );
}
