import { useQuery } from "@tanstack/react-query";
import { memberPortalApi } from "../../services/memberPortal.api";
import type { MemberWorkoutItem } from "../types/workout.types";

export const memberWorkoutQueryKeys = {
  all: ["memberWorkouts"] as const,
  list: () => [...memberWorkoutQueryKeys.all, "list"] as const,
};

export function useMemberWorkout() {
  const query = useQuery({
    queryKey: memberWorkoutQueryKeys.list(),
    queryFn: async () => {
      const response = await memberPortalApi.getWorkouts();
      return (response.data || []) as MemberWorkoutItem[];
    },
    staleTime: 1000 * 60 * 5,
  });

  return {
    workouts: query.data as MemberWorkoutItem[] | undefined,
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}
