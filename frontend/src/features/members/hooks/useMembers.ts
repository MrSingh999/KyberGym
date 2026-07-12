import { useQuery } from "@tanstack/react-query";
import { PaginationState, SortingState } from "@tanstack/react-table";
import { apiClient } from "../../../../lib/apiClient";
import { useGymStore } from "../../../../store/gym.store";
import { useMemberDirectoryStore } from "../store/useMemberDirectoryStore";
import { MembersResponse } from "../types";

export function useMembers(pagination: PaginationState, sorting: SortingState) {
  const { selectedGymId } = useGymStore();
  const { searchQuery, filters } = useMemberDirectoryStore();

  return useQuery<MembersResponse>({
    queryKey: [
      "members", 
      selectedGymId, 
      pagination, 
      sorting, 
      searchQuery, 
      filters
    ],
    queryFn: async () => {
      // API call with all params. 
      // const response = await apiClient.get('/members', { params: { gymId, ... }});
      // return response.data;

      // Mock implementation for UI scaffolding
      await new Promise(resolve => setTimeout(resolve, 800)); // Network latency mock
      
      return {
        data: Array.from({ length: pagination.pageSize }).map((_, i) => ({
          id: `member-${pagination.pageIndex * pagination.pageSize + i}`,
          memberCode: `KGM-${1000 + (pagination.pageIndex * pagination.pageSize + i)}`,
          name: `Jane Doe ${i}`,
          phone: "+1 234 567 8900",
          email: `jane${i}@example.com`,
          gender: "female",
          joiningDate: "2023-11-01",
          membershipStatus: i % 4 === 0 ? "Expiring Soon" : i % 7 === 0 ? "Expired" : "Active",
          planName: i % 2 === 0 ? "Pro Monthly" : "Elite Annual",
          assignedTrainerName: "Coach Alex",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })),
        meta: {
          pageIndex: pagination.pageIndex,
          pageSize: pagination.pageSize,
          pageCount: 15,
          totalCount: 150,
        }
      };
    },
    enabled: !!selectedGymId,
    staleTime: 60 * 1000,
  });
}
