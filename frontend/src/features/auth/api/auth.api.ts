import { apiClient } from "../../../lib/apiClient";
import type { LoginFormData } from "../schemas/auth.schema";

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
    const response = await apiClient.post("/auth/login", data);
    return response.data.data as LoginResponse;
  },

  logout: async () => {
    await apiClient.post("/auth/logout");
  },

  refreshToken: async (): Promise<{ accessToken: string }> => {
    const response = await apiClient.post("/auth/refresh-token");
    return response.data.data as { accessToken: string };
  },

  getMe: async (): Promise<UserProfile> => {
    const response = await apiClient.get("/auth/me");
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
