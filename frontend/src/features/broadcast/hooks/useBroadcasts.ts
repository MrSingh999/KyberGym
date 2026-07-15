import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useGymStore } from "@/store/gym.store";
import { apiClient } from "@/lib/apiClient";
import { Broadcast, BroadcastListItem, BroadcastFilters, DeliveryLog } from "../types";
import { CreateBroadcastData, UpdateBroadcastData } from "../schemas/broadcast.schema";

export const broadcastKeys = {
  all: (gymId: string) => ["broadcasts", gymId] as const,
  list: (gymId: string, params: object) => ["broadcasts", gymId, "list", params] as const,
  detail: (gymId: string, id: string) => ["broadcasts", gymId, "detail", id] as const,
};

export const deliveryLogKeys = {
  byBroadcast: (gymId: string, broadcastId: string) => ["deliveryLogs", gymId, "broadcast", broadcastId] as const,
};

interface UseBroadcastsParams {
  page?: number;
  limit?: number;
  filters?: BroadcastFilters;
}

export function useBroadcasts(params: UseBroadcastsParams = {}) {
  const { selectedGymId } = useGymStore();
  const { page = 1, limit = 10, filters = {} } = params;

  return useQuery({
    queryKey: broadcastKeys.list(selectedGymId ?? "", { page, limit, ...filters }),
    queryFn: async () => {
      const response = await apiClient.get("/broadcasts", {
        params: { page, limit, ...filters },
      });
      const data = response.data.data || [];
      const meta = response.data.meta;
      return {
        data: data.map((b: any): BroadcastListItem => ({
          id: b._id,
          title: b.title,
          channel: b.channel,
          status: b.status,
          recipientTarget: b.recipientCriteria?.target,
          scheduledAt: b.scheduledAt,
          sentAt: b.sentAt,
          createdAt: b.createdAt,
        })),
        meta: meta ? { total: meta.total, page: meta.page, limit: meta.limit, totalPages: meta.totalPages } : undefined,
      };
    },
    enabled: !!selectedGymId,
  });
}

export function useBroadcast(id: string) {
  const { selectedGymId } = useGymStore();

  return useQuery({
    queryKey: broadcastKeys.detail(selectedGymId ?? "", id),
    queryFn: async (): Promise<Broadcast> => {
      const response = await apiClient.get(`/broadcasts/${id}`);
      const b = response.data.data || response.data;
      return {
        id: b._id,
        gymId: b.gymId,
        title: b.title,
        channel: b.channel,
        messageTemplateId: b.messageTemplateId?._id || b.messageTemplateId,
        message: b.message,
        recipientCriteria: {
          target: b.recipientCriteria?.target || "all",
          selectedMemberIds: b.recipientCriteria?.selectedMemberIds || [],
        },
        status: b.status || "draft",
        scheduledAt: b.scheduledAt,
        sentAt: b.sentAt,
        createdBy: b.createdBy,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
      };
    },
    enabled: !!selectedGymId && !!id,
  });
}

export function useCreateBroadcast() {
  const { selectedGymId } = useGymStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateBroadcastData) => {
      const payload = {
        ...data,
        scheduledAt: data.scheduledAt || undefined,
        recipientCriteria: {
          target: data.recipientCriteria.target,
          selectedMemberIds: data.recipientCriteria.selectedMemberIds || [],
        },
      };
      const response = await apiClient.post("/broadcasts", payload);
      return response.data.data || response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: broadcastKeys.all(selectedGymId ?? "") });
    },
  });
}

export function useUpdateBroadcast(id: string) {
  const { selectedGymId } = useGymStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateBroadcastData) => {
      const response = await apiClient.patch(`/broadcasts/${id}`, data);
      return response.data.data || response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: broadcastKeys.all(selectedGymId ?? "") });
      queryClient.invalidateQueries({ queryKey: broadcastKeys.detail(selectedGymId ?? "", id) });
    },
  });
}

export function useDeleteBroadcast() {
  const { selectedGymId } = useGymStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/broadcasts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: broadcastKeys.all(selectedGymId ?? "") });
    },
  });
}

export function useSendBroadcast(id: string) {
  const { selectedGymId } = useGymStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post(`/broadcasts/${id}/send`);
      return response.data.data || response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: broadcastKeys.all(selectedGymId ?? "") });
      queryClient.invalidateQueries({ queryKey: broadcastKeys.detail(selectedGymId ?? "", id) });
    },
  });
}

export function useDeliveryLogs(broadcastId: string) {
  const { selectedGymId } = useGymStore();

  return useQuery({
    queryKey: deliveryLogKeys.byBroadcast(selectedGymId ?? "", broadcastId),
    queryFn: async () => {
      const response = await apiClient.get("/delivery-logs", {
        params: { broadcastId, limit: 200 },
      });
      const data = response.data.data || [];
      return data.map((l: any): DeliveryLog => ({
        id: l._id,
        gymId: l.gymId,
        broadcastId: l.broadcastId?._id || l.broadcastId,
        memberId: l.memberId?._id || l.memberId,
        memberName: l.memberId?.fullName,
        memberPhone: l.memberId?.phone,
        status: l.status,
        errorMessage: l.errorMessage,
        sentAt: l.sentAt,
        createdAt: l.createdAt,
      }));
    },
    enabled: !!selectedGymId && !!broadcastId,
  });
}
