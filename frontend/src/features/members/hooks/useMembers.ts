import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
      // If due tracking filter is selected, fetch due tracking dashboard stats and filter/map
      if (filters.dueStatus && filters.dueStatus !== "all") {
        const response = await apiClient.get('/dashboard/due-tracking');
        const { dueToday, dueIn3Days, dueIn7Days } = response.data.data;
        
        let subList = [];
        if (filters.dueStatus === "today") subList = dueToday || [];
        else if (filters.dueStatus === "3days") subList = dueIn3Days || [];
        else if (filters.dueStatus === "7days") subList = dueIn7Days || [];

        // Map and resolve member details
        let mapped = subList.map((sub: any) => {
          const m = sub.memberId;
          return {
            id: m._id,
            memberCode: m.memberCode,
            name: m.fullName,
            phone: m.phone || "No phone",
            email: m.email || "No email",
            gender: m.gender || "male",
            joiningDate: m.joinDate ? new Date(m.joinDate).toISOString().split('T')[0] : "",
            membershipStartDate: sub.startDate ? new Date(sub.startDate).toISOString().split('T')[0] : "",
            membershipEndDate: sub.endDate ? new Date(sub.endDate).toISOString().split('T')[0] : "",
            membershipStatus: "Active" as const,
            planName: sub.membershipPlanId?.name || "Pro Monthly",
            createdAt: m.createdAt,
            updatedAt: m.updatedAt,
          };
        });

        // Apply search locally
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          mapped = mapped.filter((item: any) => 
            item.name.toLowerCase().includes(q) || 
            item.phone.toLowerCase().includes(q) ||
            item.email.toLowerCase().includes(q) ||
            item.memberCode.toLowerCase().includes(q)
          );
        }

        // Apply sorting locally
        const sort = sorting[0];
        if (sort) {
          mapped.sort((a: any, b: any) => {
            const aVal = a[sort.id] || "";
            const bVal = b[sort.id] || "";
            const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
            return sort.desc ? -cmp : cmp;
          });
        }

        const total = mapped.length;
        const pageIndex = pagination.pageIndex;
        const pageSize = pagination.pageSize;
        const sliced = mapped.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);

        return {
          data: sliced,
          meta: {
            pageIndex,
            pageSize,
            pageCount: Math.ceil(total / pageSize) || 1,
            totalCount: total,
          }
        };
      }

      // Default members fetch
      const [membersRes, subsRes] = await Promise.all([
        apiClient.get('/members', {
          params: {
            page: pagination.pageIndex + 1,
            limit: pagination.pageSize,
            search: searchQuery || undefined,
            status: filters.status?.[0] || undefined,
          }
        }),
        apiClient.get('/member-subscriptions', {
          params: { limit: 1000 }
        }).catch(() => ({ data: { data: [] } }))
      ]);

      const responseData = membersRes.data.data;
      const meta = membersRes.data.meta;

      const subsByMember = new Map<string, any>();
      (subsRes.data.data || []).forEach((sub: any) => {
        const mid = typeof sub.memberId === 'string' ? sub.memberId : sub.memberId?._id;
        if (mid && !subsByMember.has(mid)) {
          subsByMember.set(mid, sub);
        }
      });

      const mappedMembers = responseData.map((m: any) => {
        const latestSub = subsByMember.get(m._id);
        const planName = latestSub?.membershipPlanId?.name || "No plan";
        const membershipStartDate = latestSub?.startDate ? new Date(latestSub.startDate).toISOString().split('T')[0] : "";
        const membershipEndDate = latestSub?.endDate ? new Date(latestSub.endDate).toISOString().split('T')[0] : "";

        return {
          id: m._id,
          memberCode: m.memberCode,
          name: m.fullName,
          phone: m.phone || "No phone",
          email: m.email || "No email",
          gender: m.gender || "male",
          joiningDate: m.joinDate ? new Date(m.joinDate).toISOString().split('T')[0] : "",
          membershipStartDate,
          membershipEndDate,
          membershipStatus: m.status === 'active' ? 'Active' as const : m.status === 'expired' ? 'Expired' as const : m.status === 'suspended' ? 'Suspended' as const : 'Inactive' as const,
          planName,
          createdAt: m.createdAt,
          updatedAt: m.updatedAt,
        };
      });

      return {
        data: mappedMembers,
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

// ------ Mutations ------

export function useCreateMember() {
  const { selectedGymId } = useGymStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post('/members', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members", selectedGymId] });
    },
  });
}

export function useUpdateMember(memberId: string) {
  const { selectedGymId } = useGymStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.patch(`/members/${memberId}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members", selectedGymId] });
      queryClient.invalidateQueries({ queryKey: ["member", selectedGymId, memberId] });
    },
  });
}

export function useDeleteMember() {
  const { selectedGymId } = useGymStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (memberId: string) => {
      const response = await apiClient.delete(`/members/${memberId}`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members", selectedGymId] });
    },
  });
}
