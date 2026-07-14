import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PaginationState, SortingState } from "@tanstack/react-table";
import { apiClient } from "@/lib/apiClient";
import { useGymStore } from "@/store/gym.store";
import { useAttendanceStore } from "../store/useAttendanceStore";
import { AttendanceResponse, AttendanceStats } from "../types";

export const attendanceKeys = {
  all: (gymId: string) => ["attendance", gymId] as const,
  list: (gymId: string, params: Record<string, unknown>) =>
    ["attendance", gymId, "list", params] as const,
  stats: (gymId: string, period?: string) =>
    ["attendance", gymId, "stats", period] as const,
  member: (gymId: string, memberId: string) =>
    ["attendance", gymId, "member", memberId] as const,
};

export function useAttendanceList(
  pagination: PaginationState,
  sorting: SortingState
) {
  const { selectedGymId } = useGymStore();
  const { searchQuery, statusFilter, periodFilter, dateFilter } =
    useAttendanceStore();

  return useQuery<AttendanceResponse>({
    queryKey: attendanceKeys.list(selectedGymId ?? "", {
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      sort: sorting[0]?.id,
      order: sorting[0]?.desc ? "desc" : "asc",
      search: searchQuery || undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
      period: periodFilter !== "all" ? periodFilter : undefined,
      date: dateFilter || undefined,
    }),
    queryFn: async () => {
      const response = await apiClient.get("/attendance", {
        params: {
          page: pagination.pageIndex + 1,
          limit: pagination.pageSize,
          sort: sorting[0]?.id,
          order: sorting[0]?.desc ? "desc" : "asc",
          search: searchQuery || undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
          period: periodFilter !== "all" ? periodFilter : undefined,
          date: dateFilter || undefined,
        },
      });
      const res = response.data;
      return {
        data: res.data || [],
        meta: res.meta
          ? {
              pageIndex: (res.meta.page || res.meta.pageIndex || 1) - 1,
              pageSize: res.meta.limit || res.meta.pageSize || 10,
              pageCount: res.meta.totalPages || res.meta.pageCount || 1,
              totalCount: res.meta.total || res.meta.totalCount || 0,
            }
          : { pageIndex: 0, pageSize: 10, pageCount: 1, totalCount: 0 },
      };
    },
    enabled: !!selectedGymId,
    staleTime: 30 * 1000,
  });
}

export function useAttendanceStats(period?: string) {
  const { selectedGymId } = useGymStore();

  return useQuery<AttendanceStats>({
    queryKey: attendanceKeys.stats(selectedGymId ?? "", period),
    queryFn: async () => {
      const response = await apiClient.get("/attendance/stats", {
        params: period ? { period } : undefined,
      });
      return response.data.data;
    },
    enabled: !!selectedGymId,
    staleTime: 30 * 1000,
  });
}

export function useMemberAttendance(
  memberId: string,
  pagination: PaginationState
) {
  const { selectedGymId } = useGymStore();

  return useQuery({
    queryKey: [
      ...attendanceKeys.member(selectedGymId ?? "", memberId),
      pagination,
    ],
    queryFn: async () => {
      const response = await apiClient.get(
        `/attendance/members/${memberId}`,
        {
          params: {
            page: pagination.pageIndex + 1,
            limit: pagination.pageSize,
          },
        }
      );
      const res = response.data;
      return {
        data: res.data || [],
        meta: res.meta
          ? {
              pageIndex: (res.meta.page || res.meta.pageIndex || 1) - 1,
              pageSize: res.meta.limit || res.meta.pageSize || 10,
              pageCount: res.meta.totalPages || res.meta.pageCount || 1,
              totalCount: res.meta.total || res.meta.totalCount || 0,
            }
          : { pageIndex: 0, pageSize: 10, pageCount: 1, totalCount: 0 },
      };
    },
    enabled: !!selectedGymId && !!memberId,
    staleTime: 30 * 1000,
  });
}

export function useMarkAttendance() {
  const { selectedGymId } = useGymStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      memberId: string;
      status: "present" | "absent" | "late";
      notes?: string;
    }) => {
      const response = await apiClient.post("/attendance", data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.all(selectedGymId ?? ""),
      });
    },
  });
}

export function useUpdateAttendance() {
  const { selectedGymId } = useGymStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: {
        status?: "present" | "absent" | "late";
        checkOutTime?: string;
        notes?: string;
      };
    }) => {
      const response = await apiClient.patch(`/attendance/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.all(selectedGymId ?? ""),
      });
    },
  });
}
