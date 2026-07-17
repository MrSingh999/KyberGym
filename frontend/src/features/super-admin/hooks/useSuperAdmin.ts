import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { SuperAdminDashboard, GymTenant, GymTenantListItem } from "../types";

const SA_PREFIX = "/super-admin";

export const saKeys = {
  dashboard: ["sa-dashboard"] as const,
  gyms: (params: object) => ["sa-gyms", params] as const,
  gym: (id: string) => ["sa-gym", id] as const,
  subscription: (id: string) => ["sa-subscription", id] as const,
};

export function useSALogin() {
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await apiClient.post(`${SA_PREFIX}/login`, { email, password });
      return response.data.data;
    },
  });
}

export function useSADashboard() {
  return useQuery<SuperAdminDashboard>({
    queryKey: saKeys.dashboard,
    queryFn: async () => {
      const response = await apiClient.get(`${SA_PREFIX}/dashboard`);
      return response.data.data;
    },
    staleTime: 60 * 1000,
  });
}

interface UseSAGymsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  isActive?: string;
}

export function useSAGyms(params: UseSAGymsParams = {}) {
  const { page = 1, limit = 10, search, status, isActive } = params;

  return useQuery({
    queryKey: saKeys.gyms({ page, limit, search, status, isActive }),
    queryFn: async () => {
      const response = await apiClient.get(`${SA_PREFIX}/gyms`, {
        params: { page, limit, search, status, isActive },
      });
      const gyms = response.data.data;
      const meta = response.data.meta;
      return {
        data: (gyms || []).map((g: any): GymTenantListItem => ({
          id: g.id || g._id,
          name: g.name,
          subdomain: g.subdomain,
          subscriptionStatus: g.subscription?.status || "unknown",
          isActive: g.isActive,
          isDeleted: g.isDeleted,
          deletedAt: g.deletedAt,
          createdAt: g.createdAt,
        })),
        meta: meta || { page: 1, limit: 10, total: 0, totalPages: 0 },
      };
    },
    staleTime: 30 * 1000,
  });
}

export function useSAGym(id: string) {
  return useQuery<GymTenant>({
    queryKey: saKeys.gym(id),
    queryFn: async () => {
      const response = await apiClient.get(`${SA_PREFIX}/gyms/${id}`);
      const g = response.data.data;
      return {
        id: g.id || g._id,
        name: g.name,
        slug: g.slug,
        subdomain: g.subdomain,
        owner: g.ownerId && typeof g.ownerId === "object" ? {
          id: g.ownerId.id || g.ownerId._id,
          name: g.ownerId.name,
          email: g.ownerId.email,
          phone: g.ownerId.phone,
        } : undefined,
        features: g.features || {},
        branding: g.branding || {},
        subscription: g.subscription ? {
          plan: g.subscription.plan,
          status: g.subscription.status,
          startDate: g.subscription.startDate,
          expiresAt: g.subscription.expiresAt,
          trialEndsAt: g.subscription.trialEndsAt,
        } : { status: "trial", plan: "" },
        subscriptionHistory: g.subscriptionHistory || [],
        timezone: g.timezone || "Asia/Kolkata",
        currency: g.currency || "INR",
        language: g.language || "en",
        isActive: g.isActive,
        isDeleted: g.isDeleted,
        createdAt: g.createdAt,
        updatedAt: g.updatedAt,
      };
    },
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

export function useSACreateGym() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { gymName: string; subdomain: string; ownerName: string; email: string; password?: string; phone?: string }) => {
      const response = await apiClient.post(`${SA_PREFIX}/gyms`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sa-gyms"] });
    },
  });
}

export function useSAUpdateGym(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name?: string; timezone?: string; currency?: string; language?: string }) => {
      const response = await apiClient.patch(`${SA_PREFIX}/gyms/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: saKeys.gym(id) });
      queryClient.invalidateQueries({ queryKey: ["sa-gyms"] });
    },
  });
}

export function useSADeleteGym() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`${SA_PREFIX}/gyms/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sa-gyms"] });
      queryClient.invalidateQueries({ queryKey: ["sa-dashboard"] });
    },
  });
}

export function useSARestoreGym() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.patch(`${SA_PREFIX}/gyms/${id}/restore`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sa-gyms"] });
      queryClient.invalidateQueries({ queryKey: ["sa-dashboard"] });
    },
  });
}

export function useSAPermanentDeleteGym() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`${SA_PREFIX}/gyms/${id}/permanent`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sa-gyms"] });
      queryClient.invalidateQueries({ queryKey: ["sa-dashboard"] });
    },
  });
}

export function useSASuspendGym() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.patch(`${SA_PREFIX}/gyms/${id}/suspend`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sa-gyms"] });
    },
  });
}

export function useSAActivateGym() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.patch(`${SA_PREFIX}/gyms/${id}/activate`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sa-gyms"] });
    },
  });
}

export function useSAUpdateFeatures(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (features: Record<string, boolean>) => {
      const response = await apiClient.patch(`${SA_PREFIX}/gyms/${id}/features`, features);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: saKeys.gym(id) });
    },
  });
}

export function useSAGetSubscription(id: string) {
  return useQuery({
    queryKey: saKeys.subscription(id),
    queryFn: async () => {
      const response = await apiClient.get(`${SA_PREFIX}/gyms/${id}/subscription`);
      return response.data.data;
    },
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

export function useSAUpdateSubscription(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { status?: string; expiresAt?: string | null; trialEndsAt?: string | null }) => {
      const response = await apiClient.patch(`${SA_PREFIX}/gyms/${id}/subscription`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: saKeys.gym(id) });
      queryClient.invalidateQueries({ queryKey: saKeys.subscription(id) });
      queryClient.invalidateQueries({ queryKey: ["sa-gyms"] });
    },
  });
}

export function useSARenewSubscription(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { startDate: string; expiresAt: string; amountPaid: number; duration?: number }) => {
      const response = await apiClient.patch(`${SA_PREFIX}/gyms/${id}/renew`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: saKeys.gym(id) });
      queryClient.invalidateQueries({ queryKey: ["sa-gyms"] });
    },
  });
}
