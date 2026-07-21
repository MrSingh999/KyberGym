import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useGymStore } from "@/store/gym.store";
import { apiClient } from "@/lib/apiClient";
import { WorkoutAssignment, WorkoutAssignmentListItem, AssignWorkoutData, UpdateAssignmentData, AssignmentFilters, PaginatedAssignments } from "../types";
import { SortingState } from "@tanstack/react-table";

export const assignmentKeys = {
  all: (gymId: string) => ["workoutAssignments", gymId] as const,
  list: (gymId: string, params: object) => ["workoutAssignments", gymId, "list", params] as const,
  detail: (gymId: string, id: string) => ["workoutAssignments", gymId, "detail", id] as const,
  member: (gymId: string, memberId: string) => ["workoutAssignments", gymId, "member", memberId] as const,
};

interface UseAssignmentsParams {
  search?: string;
  filters?: AssignmentFilters;
  sorting?: SortingState;
  page?: number;
  limit?: number;
}

export function useAssignments(params: UseAssignmentsParams = {}) {
  const { selectedGymId } = useGymStore();
  const { search = "", filters = {}, sorting, page = 1, limit = 50 } = params;

  const queryParams = new URLSearchParams();
  if (search) queryParams.set("search", search);
  if (filters.status) queryParams.set("status", filters.status);
  if (filters.workoutId) queryParams.set("workoutId", filters.workoutId);
  if (filters.memberId) queryParams.set("memberId", filters.memberId);
  if (sorting?.length) {
    const { id, desc } = sorting[0];
    queryParams.set("sort", id);
    queryParams.set("order", desc ? "desc" : "asc");
  }
  queryParams.set("page", String(page));
  queryParams.set("limit", String(limit));
  const qs = queryParams.toString();

  return useQuery({
    queryKey: assignmentKeys.list(selectedGymId ?? "", { search, filters, sorting, page, limit }),
    queryFn: async (): Promise<PaginatedAssignments> => {
      const response = await apiClient.get(`/workout-assignments${qs ? `?${qs}` : ""}`);
      const raw = response.data.data || response.data;

      const items = (Array.isArray(raw) ? raw : raw.data ?? []).map((a: any): WorkoutAssignmentListItem => ({
        id: a._id || a.id,
        workoutTitle: a.workoutId?.title ?? "Unknown",
        workoutId: a.workoutId?._id ?? a.workoutId,
        memberName: a.memberId?.fullName ?? "Unknown",
        memberId: a.memberId?._id ?? a.memberId,
        status: a.status ?? "ACTIVE",
        assignedAt: a.assignedAt ?? a.createdAt,
        startDate: a.startDate,
        endDate: a.endDate,
      }));

      return {
        data: items,
        total: raw.total ?? items.length,
        page: raw.page ?? 1,
        limit: raw.limit ?? limit,
        totalPages: raw.totalPages ?? 1,
      };
    },
    enabled: !!selectedGymId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useAssignment(id: string) {
  const { selectedGymId } = useGymStore();

  return useQuery<WorkoutAssignment>({
    queryKey: assignmentKeys.detail(selectedGymId ?? "", id),
    queryFn: async () => {
      const response = await apiClient.get(`/workout-assignments/${id}`);
      const a = response.data.data || response.data;
      return {
        _id: a._id || a.id,
        gymId: a.gymId,
        workoutId: a.workoutId,
        memberId: a.memberId,
        status: a.status,
        assignedBy: a.assignedBy,
        assignedAt: a.assignedAt ?? a.createdAt,
        startDate: a.startDate,
        endDate: a.endDate,
        removedBy: a.removedBy,
        removedAt: a.removedAt,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useAssignWorkout() {
  const { selectedGymId } = useGymStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AssignWorkoutData) => {
      const payload: any = {
        workoutId: data.workoutId,
        assignmentType: data.assignmentType,
        memberIds: data.assignmentType === "SELECTED" ? data.memberIds : [],
      };
      if (data.startDate) {
        payload.startDate = new Date(data.startDate).toISOString();
      }
      if (data.endDate) {
        payload.endDate = new Date(data.endDate).toISOString();
      }
      const response = await apiClient.post("/workout-assignments", payload);
      return response.data.data || response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assignmentKeys.all(selectedGymId ?? "") });
    },
  });
}

export function useUpdateAssignment(id: string) {
  const { selectedGymId } = useGymStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateAssignmentData) => {
      const response = await apiClient.patch(`/workout-assignments/${id}`, data);
      return response.data.data || response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assignmentKeys.all(selectedGymId ?? "") });
      queryClient.invalidateQueries({ queryKey: assignmentKeys.detail(selectedGymId ?? "", id) });
    },
  });
}

export function useRemoveAssignment() {
  const { selectedGymId } = useGymStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/workout-assignments/${id}`);
      return response.data.data || response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assignmentKeys.all(selectedGymId ?? "") });
    },
  });
}

export function useMemberAssignments(memberId: string) {
  const { selectedGymId } = useGymStore();

  return useQuery<WorkoutAssignment[]>({
    queryKey: assignmentKeys.member(selectedGymId ?? "", memberId),
    queryFn: async () => {
      const response = await apiClient.get(`/workout-assignments/member/${memberId}`);
      const raw = response.data.data || response.data;
      return (Array.isArray(raw) ? raw : []).map((a: any): WorkoutAssignment => ({
        _id: a._id || a.id,
        gymId: a.gymId,
        workoutId: a.workoutId,
        memberId: a.memberId,
        status: a.status,
        assignedBy: a.assignedBy,
        assignedAt: a.assignedAt ?? a.createdAt,
        startDate: a.startDate,
        endDate: a.endDate,
        removedBy: a.removedBy,
        removedAt: a.removedAt,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
      }));
    },
    enabled: !!selectedGymId && !!memberId,
    staleTime: 2 * 60 * 1000,
  });
}
