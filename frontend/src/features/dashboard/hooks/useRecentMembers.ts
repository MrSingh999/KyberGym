import { useQuery } from "@tanstack/react-query";
import { useGymStore } from "@/store/gym.store";
import { fetchRecentMembers, RecentMember } from "../api/dashboard.api";

export function useRecentMembers() {
  const { selectedGymId } = useGymStore();

  return useQuery<RecentMember[]>({
    queryKey: ["dashboard", "recent-members", selectedGymId],
    queryFn: () => fetchRecentMembers(5),
    enabled: !!selectedGymId,
    staleTime: 3 * 60 * 1000,
  });
}
