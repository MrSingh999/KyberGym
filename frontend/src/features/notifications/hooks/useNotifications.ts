import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useGymStore } from "@/store/gym.store";
import { useNotificationStore } from "@/store/notification.store";
import { apiClient } from "@/lib/apiClient";
import { Notification, NotificationsResponse } from "../types";

export const notificationKeys = {
  all: (gymId: string) => ["notifications", gymId] as const,
  list: (gymId: string, params: object) => ["notifications", gymId, "list", params] as const,
};

interface UseNotificationsParams {
  page?: number;
  limit?: number;
  read?: boolean;
}

export function useNotifications(params: UseNotificationsParams = {}) {
  const { selectedGymId } = useGymStore();
  const { page = 1, limit = 10, read } = params;

  return useQuery<NotificationsResponse>({
    queryKey: notificationKeys.list(selectedGymId ?? "", { page, limit, read }),
    queryFn: async () => {
      const response = await apiClient.get("/notifications", {
        params: { page, limit, read: read !== undefined ? String(read) : undefined },
      });
      const data = response.data.data;
      const meta = response.data.meta;
      return {
        data: data.map((n: any) => ({
          id: n.id || n._id,
          gymId: n.gymId,
          userId: n.userId,
          type: n.type,
          title: n.title,
          message: n.message,
          data: n.data,
          read: n.read,
          readAt: n.readAt,
          createdAt: n.createdAt,
          updatedAt: n.updatedAt,
        })),
        meta: {
          total: meta.total,
          page: meta.page,
          limit: meta.limit,
          totalPages: meta.totalPages,
        },
      };
    },
    enabled: !!selectedGymId,
    staleTime: 30 * 1000,
  });
}

export function useUnreadCount() {
  const { selectedGymId } = useGymStore();
  const { setUnreadCount } = useNotificationStore();

  return useQuery({
    queryKey: notificationKeys.list(selectedGymId ?? "", { unreadCount: true }),
    queryFn: async () => {
      const response = await apiClient.get("/notifications", {
        params: { page: 1, limit: 1, read: "false" },
      });
      const total = response.data.meta?.total ?? 0;
      setUnreadCount(total);
      return total;
    },
    enabled: !!selectedGymId,
    refetchInterval: 30000,
    staleTime: 15000,
  });
}

export function useMarkAsRead() {
  const { selectedGymId } = useGymStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.patch(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all(selectedGymId ?? "") });
    },
  });
}

export function useMarkAllAsRead() {
  const { selectedGymId } = useGymStore();
  const queryClient = useQueryClient();
  const { setUnreadCount } = useNotificationStore();

  return useMutation({
    mutationFn: async () => {
      await apiClient.patch("/notifications/read-all");
    },
    onSuccess: () => {
      setUnreadCount(0);
      queryClient.invalidateQueries({ queryKey: notificationKeys.all(selectedGymId ?? "") });
    },
  });
}
