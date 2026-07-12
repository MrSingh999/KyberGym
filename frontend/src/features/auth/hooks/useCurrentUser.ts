import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../../lib/apiClient";
import { useAuthStore } from "../../../store/auth.store";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: "superadmin" | "owner" | "member";
  avatarUrl?: string;
  lastLogin?: string;
  onboardingCompleted: boolean;
}

export function useCurrentUser() {
  const { isAuthenticated } = useAuthStore();

  return useQuery<UserProfile>({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const response = await apiClient.get(`/users/me`);
      return response.data;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
