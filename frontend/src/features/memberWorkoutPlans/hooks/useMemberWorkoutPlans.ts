import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useGymStore } from "@/store/gym.store";
import { apiClient } from "@/lib/apiClient";
import {
  MemberWorkoutPlanWithDays, PlanListItem, CreatePlanData, NestedSaveData, PlanQueryParams,
} from "../types";

export const planKeys = {
  all: (gymId: string) => ["memberWorkoutPlans", gymId] as const,
  list: (gymId: string, params: object) => ["memberWorkoutPlans", gymId, "list", params] as const,
  detail: (gymId: string, id: string) => ["memberWorkoutPlans", gymId, "detail", id] as const,
  my: (gymId: string, params: object) => ["memberWorkoutPlans", gymId, "my", params] as const,
  member: (gymId: string, memberId: string, params: object) => ["memberWorkoutPlans", gymId, "member", memberId, params] as const,
};

export function useMemberWorkoutPlans(params: PlanQueryParams = {}) {
  const { selectedGymId } = useGymStore();
  const qs = new URLSearchParams();
  if (params.search) qs.set("search", params.search);
  if (params.status) qs.set("status", params.status);
  if (params.trainerId) qs.set("trainerId", params.trainerId);
  if (params.memberId) qs.set("memberId", params.memberId);
  if (params.sort) qs.set("sort", params.sort);
  if (params.order) qs.set("order", params.order);
  qs.set("page", String(params.page ?? 1));
  qs.set("limit", String(params.limit ?? 20));
  const queryStr = qs.toString();

  return useQuery({
    queryKey: planKeys.list(selectedGymId ?? "", params),
    queryFn: async () => {
      const res = await apiClient.get(`/member-workout-plans${queryStr ? `?${queryStr}` : ""}`);
      const raw = res.data.data || [];
      const meta = res.data.meta || { page: 1, limit: 20, total: 0, totalPages: 1 };
      const items: PlanListItem[] = raw.map((p: any) => ({
        id: p._id || p.id,
        title: p.title,
        description: p.description,
        goal: p.goal,
        category: p.category,
        estimatedDuration: p.estimatedDuration,
        status: p.status,
        memberId: p.memberId?._id || p.memberId,
        memberName: p.memberName,
        trainerName: p.trainerName,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      }));
      return { data: items, ...meta };
    },
    enabled: !!selectedGymId,
  });
}

export function useMyPlans(params: PlanQueryParams = {}) {
  const { selectedGymId } = useGymStore();
  const qs = new URLSearchParams();
  if (params.search) qs.set("search", params.search);
  if (params.status) qs.set("status", params.status);
  if (params.sort) qs.set("sort", params.sort);
  if (params.order) qs.set("order", params.order);
  qs.set("page", String(params.page ?? 1));
  qs.set("limit", String(params.limit ?? 20));
  const queryStr = qs.toString();

  return useQuery({
    queryKey: planKeys.my(selectedGymId ?? "", params),
    queryFn: async () => {
      const res = await apiClient.get(`/member-workout-plans/my${queryStr ? `?${queryStr}` : ""}`);
      const raw = res.data.data || [];
      const meta = res.data.meta || { page: 1, limit: 20, total: 0, totalPages: 1 };
      const items: PlanListItem[] = raw.map((p: any) => ({
        id: p._id || p.id,
        title: p.title,
        description: p.description,
        goal: p.goal,
        category: p.category,
        estimatedDuration: p.estimatedDuration,
        status: p.status,
        memberId: p.memberId?._id || p.memberId,
        memberName: p.memberName,
        trainerName: p.trainerName,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      }));
      return { data: items, ...meta };
    },
    enabled: !!selectedGymId,
  });
}

export function useMemberPlans(memberId: string, params: PlanQueryParams = {}) {
  const { selectedGymId } = useGymStore();
  const qs = new URLSearchParams();
  if (params.search) qs.set("search", params.search);
  if (params.status) qs.set("status", params.status);
  if (params.sort) qs.set("sort", params.sort);
  if (params.order) qs.set("order", params.order);
  qs.set("page", String(params.page ?? 1));
  qs.set("limit", String(params.limit ?? 20));
  const queryStr = qs.toString();

  return useQuery({
    queryKey: planKeys.member(selectedGymId ?? "", memberId, params),
    queryFn: async () => {
      const res = await apiClient.get(`/member-workout-plans/member/${memberId}${queryStr ? `?${queryStr}` : ""}`);
      const raw = res.data.data || [];
      const meta = res.data.meta || { page: 1, limit: 20, total: 0, totalPages: 1 };
      const items: PlanListItem[] = raw.map((p: any) => ({
        id: p._id || p.id,
        title: p.title,
        description: p.description,
        goal: p.goal,
        category: p.category,
        estimatedDuration: p.estimatedDuration,
        status: p.status,
        memberId: p.memberId?._id || p.memberId,
        memberName: p.memberName,
        trainerName: p.trainerName,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      }));
      return { data: items, ...meta };
    },
    enabled: !!selectedGymId && !!memberId,
  });
}

export function useMemberWorkoutPlan(id: string) {
  const { selectedGymId } = useGymStore();

  return useQuery<MemberWorkoutPlanWithDays>({
    queryKey: planKeys.detail(selectedGymId ?? "", id),
    queryFn: async () => {
      const res = await apiClient.get(`/member-workout-plans/${id}`);
      const p = res.data.data || res.data;
      return { ...p, _id: p._id || p.id, days: p.days || [] };
    },
    enabled: !!selectedGymId && !!id,
  });
}

export function useCreateMemberWorkoutPlan() {
  const { selectedGymId } = useGymStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePlanData) => {
      const res = await apiClient.post("/member-workout-plans", data);
      return res.data.data || res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: planKeys.all(selectedGymId ?? "") });
    },
  });
}

export function useSaveNestedPlan(id: string) {
  const { selectedGymId } = useGymStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: NestedSaveData) => {
      const res = await apiClient.put(`/member-workout-plans/${id}/nested`, data);
      return res.data.data || res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: planKeys.all(selectedGymId ?? "") });
      queryClient.invalidateQueries({ queryKey: planKeys.detail(selectedGymId ?? "", id) });
    },
  });
}

export function useArchivePlan() {
  const { selectedGymId } = useGymStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.post(`/member-workout-plans/${id}/archive`);
      return res.data.data || res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: planKeys.all(selectedGymId ?? "") });
    },
  });
}

export function useUpdatePlan(id: string) {
  const { selectedGymId } = useGymStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.patch(`/member-workout-plans/${id}`, data);
      return res.data.data || res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: planKeys.all(selectedGymId ?? "") });
      queryClient.invalidateQueries({ queryKey: planKeys.detail(selectedGymId ?? "", id) });
    },
  });
}
