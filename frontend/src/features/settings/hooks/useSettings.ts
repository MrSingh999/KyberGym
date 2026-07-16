import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

export const settingsKeys = {
  gym: ["gym-me"] as const,
};

interface GymSettings {
  _id: string;
  name: string;
  subdomain: string;
  timezone: string;
  currency: string;
  language: string;
  isActive: boolean;
  branding: Record<string, unknown>;
  features: Record<string, boolean>;
  subscription: { status: string; plan?: string };
  createdAt: string;
  updatedAt: string;
}

export function useGymSettings() {
  return useQuery<GymSettings>({
    queryKey: settingsKeys.gym,
    queryFn: async () => {
      const response = await apiClient.get("/gyms/me");
      return response.data.data;
    },
    staleTime: 30 * 1000,
  });
}

export function useUpdateGymSettings() {
  return useMutation({
    mutationFn: async (data: { name?: string; timezone?: string; currency?: string; language?: string }) => {
      const response = await apiClient.patch("/gyms/me", data);
      return response.data.data;
    },
  });
}
