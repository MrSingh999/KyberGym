import axios from "axios";
import { apiClient } from "../../../lib/apiClient";
import { useAuthStore } from "../../../store/auth.store";
import type { LoginFormData } from "../schemas/auth.schema";

const SUPER_ADMIN_API = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace("/v1", "")
  : "http://localhost:5000/api";

export interface LoginResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    gymId: string;
    isEmailVerified?: boolean;
  };
  accessToken: string;
  enabledFeatures: Record<string, boolean>;
  subscriptionStatus: string;
  subscriptionExpiry: string | null;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  gymId: string;
  isEmailVerified: boolean;
}

export const authApi = {
  login: async (data: LoginFormData) => {
    try {
      const response = await apiClient.post("/auth/login", data);
      return response.data.data as LoginResponse;
    } catch {
      const response = await axios.post(`${SUPER_ADMIN_API}/super-admin/login`, data, { withCredentials: true });
      const sa = response.data.data;
      return {
        user: {
          id: sa.superAdmin.id,
          name: sa.superAdmin.fullName,
          email: sa.superAdmin.email,
          role: "superadmin",
          gymId: "",
        },
        accessToken: sa.token,
        enabledFeatures: {},
        subscriptionStatus: "",
        subscriptionExpiry: null,
      } as LoginResponse;
    }
  },

  logout: async () => {
    await apiClient.post("/auth/logout");
  },

  refreshToken: async (): Promise<{ accessToken: string }> => {
    const response = await apiClient.post("/auth/refresh-token");
    return response.data.data as { accessToken: string };
  },

  getMe: async (options?: { signal?: AbortSignal }): Promise<UserProfile> => {
    // Super admin uses a separate JWT secret and has no gym context,
    // so apiClient (which hits tenant-scoped /auth/me) would 401 and log them out.
    const storedUser = useAuthStore.getState().user;
    if (storedUser?.role === "superadmin") {
      const token = useAuthStore.getState().token;
      const response = await axios.get(`${SUPER_ADMIN_API}/super-admin/me`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
        signal: options?.signal,
      });
      const sa = response.data.data.superAdmin;
      return {
        id: sa.id,
        name: sa.fullName,
        email: sa.email,
        role: "superadmin",
        gymId: "",
        isEmailVerified: true,
      };
    }
    const response = await apiClient.get("/auth/me", { signal: options?.signal });
    return response.data.data.user as UserProfile;
  },

  forgotPassword: async (email: string) => {
    await apiClient.post("/auth/forgot-password", { email });
  },

  resetPassword: async (email: string, otp: string, newPassword: string) => {
    await apiClient.post("/auth/reset-password", { email, otp, newPassword });
  },

  verifyEmail: async (email: string, otp: string) => {
    await apiClient.post("/auth/verify-email", { email, otp });
  },
};
