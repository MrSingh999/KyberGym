import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../../lib/apiClient";
import { useAuthStore } from "../../../store/auth.store";
import { useGymStore } from "../../../store/gym.store";

export type Permission = string;

export function usePermissions() {
  const { isAuthenticated } = useAuthStore();
  const { selectedGymId } = useGymStore();

  return useQuery<Permission[]>({
    queryKey: ["permissions", selectedGymId],
    queryFn: async () => {
      // Backend is final source of truth for permissions.
      // Must pass gymId to get tenant-specific RBAC matrix.
      const response = await apiClient.get(`/permissions`, {
        params: { gymId: selectedGymId }
      });
      return response.data;
    },
    enabled: isAuthenticated && !!selectedGymId,
    staleTime: 5 * 60 * 1000, // Cache for 5 mins
  });
}

export function useHasPermission(permission: Permission) {
  const { data: permissions = [] } = usePermissions();
  return permissions.includes(permission);
}
