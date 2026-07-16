import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { StaffUsersResponse, UpdateUserData } from "../types";

export const staffKeys = {
  all: ["staff-users"] as const,
  list: (params: object) => ["staff-users", params] as const,
};

interface ListUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
}

export function useStaffUsers(params: ListUsersParams = {}) {
  const { page = 1, limit = 20, search, role, status } = params;

  return useQuery<StaffUsersResponse>({
    queryKey: staffKeys.list({ page, limit, search, role, status }),
    queryFn: async () => {
      const response = await apiClient.get("/users", {
        params: { page, limit, search, role, status },
      });
      return {
        users: response.data.data || [],
        meta: response.data.meta || { page: 1, limit: 20, total: 0, totalPages: 0 },
      };
    },
    staleTime: 30 * 1000,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: UpdateUserData }) => {
      const response = await apiClient.patch(`/users/${userId}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-users"] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      await apiClient.delete(`/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-users"] });
    },
  });
}
