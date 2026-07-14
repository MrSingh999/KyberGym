import { useQuery } from "@tanstack/react-query";
import { PaginationState, SortingState } from "@tanstack/react-table";
import { apiClient } from "@/lib/apiClient";
import { useGymStore } from "@/store/gym.store";
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
      const response = await apiClient.get('/members', {
        params: {
          page: pagination.pageIndex + 1,
          limit: pagination.pageSize,
          search: searchQuery || undefined,
          status: filters.status || undefined,
        }
      });
      const responseData = response.data.data;
      const meta = response.data.meta;
      
      return {
        data: responseData.map((m: any) => ({
          id: m._id,
          memberCode: m.memberCode,
          name: m.fullName,
          phone: m.phone || "No phone",
          email: m.email || "No email",
          gender: m.gender || "male",
          joiningDate: m.joinDate ? new Date(m.joinDate).toISOString().split('T')[0] : "",
          membershipStatus: m.status === 'active' ? 'Active' : m.status === 'expired' ? 'Expired' : m.status === 'suspended' ? 'Suspended' : 'Inactive',
          planName: "Pro Monthly",
          assignedTrainerName: "Coach Alex",
          createdAt: m.createdAt,
          updatedAt: m.updatedAt,
        })),
        meta: {
          pageIndex: meta.page - 1,
          pageSize: meta.limit,
          pageCount: meta.totalPages,
          totalCount: meta.total,
        }
      };
    },
    enabled: !!selectedGymId,
    staleTime: 60 * 1000,
  });
}
