import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useGymStore } from "@/store/gym.store";
import { apiClient } from "@/lib/apiClient";
import { Trainer, TrainerListItem, TrainerMember, CreateTrainerData, UpdateTrainerData, TrainerQueryParams } from "../types";

export const trainerKeys = {
  all: (gymId: string) => ["trainers", gymId] as const,
  list: (gymId: string, params: object) => ["trainers", gymId, "list", params] as const,
  detail: (gymId: string, id: string) => ["trainers", gymId, "detail", id] as const,
  members: (gymId: string, id: string, params: object) => ["trainers", gymId, "members", id, params] as const,
  myProfile: (gymId: string) => ["trainers", gymId, "myProfile"] as const,
  myMembers: (gymId: string, params: object) => ["trainers", gymId, "myMembers", params] as const,
};

export function useTrainers(params: TrainerQueryParams = {}) {
  const { selectedGymId } = useGymStore();

  const queryParams = new URLSearchParams();
  if (params.search) queryParams.set("search", params.search);
  if (params.status) queryParams.set("status", params.status);
  if (params.sort) queryParams.set("sort", params.sort);
  if (params.order) queryParams.set("order", params.order);
  queryParams.set("page", String(params.page ?? 1));
  queryParams.set("limit", String(params.limit ?? 20));
  const qs = queryParams.toString();

  return useQuery({
    queryKey: trainerKeys.list(selectedGymId ?? "", params),
    queryFn: async () => {
      const response = await apiClient.get(`/trainers${qs ? `?${qs}` : ""}`);
      const raw = response.data.data || [];
      const meta = response.data.meta || { page: 1, limit: 20, total: 0, totalPages: 1 };
      const items: TrainerListItem[] = raw.map((t: any) => ({
        id: t._id || t.id,
        fullName: t.fullName,
        email: t.email,
        phone: t.phone,
        specialization: t.specialization,
        status: t.status,
        memberCount: t.memberCount ?? 0,
        joiningDate: t.joiningDate,
        lastLogin: t.user?.lastLogin,
      }));
      return { data: items, ...meta };
    },
    enabled: !!selectedGymId,
  });
}

export function useTrainer(id: string) {
  const { selectedGymId } = useGymStore();

  return useQuery<Trainer>({
    queryKey: trainerKeys.detail(selectedGymId ?? "", id),
    queryFn: async () => {
      const response = await apiClient.get(`/trainers/${id}`);
      const t = response.data.data || response.data;
      return { ...t, _id: t._id || t.id };
    },
    enabled: !!selectedGymId && !!id,
  });
}

export function useTrainerMembers(id: string, params = {}) {
  const { selectedGymId } = useGymStore();

  const queryParams = new URLSearchParams();
  queryParams.set("page", String((params as any).page ?? 1));
  queryParams.set("limit", String((params as any).limit ?? 20));
  const qs = queryParams.toString();

  return useQuery({
    queryKey: trainerKeys.members(selectedGymId ?? "", id, params),
    queryFn: async () => {
      const response = await apiClient.get(`/trainers/${id}/members${qs ? `?${qs}` : ""}`);
      const raw = response.data.data || [];
      const meta = response.data.meta || { page: 1, limit: 20, total: 0, totalPages: 1 };
      return { data: raw, ...meta };
    },
    enabled: !!selectedGymId && !!id,
  });
}

export function useCreateTrainer() {
  const { selectedGymId } = useGymStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTrainerData) => {
      const response = await apiClient.post("/trainers", data);
      return response.data.data || response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trainerKeys.all(selectedGymId ?? "") });
    },
  });
}

export function useUpdateTrainer(id: string) {
  const { selectedGymId } = useGymStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateTrainerData) => {
      const response = await apiClient.patch(`/trainers/${id}`, data);
      return response.data.data || response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trainerKeys.all(selectedGymId ?? "") });
      queryClient.invalidateQueries({ queryKey: trainerKeys.detail(selectedGymId ?? "", id) });
    },
  });
}

export function useDeactivateTrainer() {
  const { selectedGymId } = useGymStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post(`/trainers/${id}/deactivate`);
      return response.data.data || response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trainerKeys.all(selectedGymId ?? "") });
    },
  });
}

export function useActivateTrainer() {
  const { selectedGymId } = useGymStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post(`/trainers/${id}/activate`);
      return response.data.data || response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trainerKeys.all(selectedGymId ?? "") });
    },
  });
}

export function useAssignMembers(trainerId: string) {
  const { selectedGymId } = useGymStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (memberIds: string[]) => {
      const response = await apiClient.post(`/trainers/${trainerId}/assign-members`, { memberIds });
      return response.data.data || response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trainerKeys.all(selectedGymId ?? "") });
      queryClient.invalidateQueries({ queryKey: trainerKeys.members(selectedGymId ?? "", trainerId, {}) });
    },
  });
}

export function useRemoveMemberAssignment(trainerId: string) {
  const { selectedGymId } = useGymStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assignmentId: string) => {
      const response = await apiClient.delete(`/trainers/${trainerId}/members/${assignmentId}`);
      return response.data.data || response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trainerKeys.all(selectedGymId ?? "") });
      queryClient.invalidateQueries({ queryKey: trainerKeys.members(selectedGymId ?? "", trainerId, {}) });
    },
  });
}

export function useMyProfile() {
  const { selectedGymId } = useGymStore();

  return useQuery({
    queryKey: trainerKeys.myProfile(selectedGymId ?? ""),
    queryFn: async () => {
      const response = await apiClient.get("/trainers/me/profile");
      const p = response.data.data || response.data;
      return { ...p, _id: p._id || p.id };
    },
    enabled: !!selectedGymId,
  });
}

export function useMyMembers(params = {}) {
  const { selectedGymId } = useGymStore();

  const queryParams = new URLSearchParams();
  queryParams.set("page", String((params as any).page ?? 1));
  queryParams.set("limit", String((params as any).limit ?? 20));
  const qs = queryParams.toString();

  return useQuery({
    queryKey: trainerKeys.myMembers(selectedGymId ?? "", params),
    queryFn: async () => {
      const response = await apiClient.get(`/trainers/me/members${qs ? `?${qs}` : ""}`);
      const raw = response.data.data || [];
      const meta = response.data.meta || { page: 1, limit: 20, total: 0, totalPages: 1 };
      return { data: raw, ...meta };
    },
    enabled: !!selectedGymId,
  });
}
