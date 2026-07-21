import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { useGymStore } from "./gym.store";
import { queryClient } from "../lib/queryClient";
import { secureStorage } from "../lib/secureStorage";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "superadmin" | "owner" | "staff" | "trainer" | "member";
  gymId?: string;
  avatarUrl?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: any, token: string) => void;
  setUser: (user: any) => void;
  setToken: (token: string) => void;
  logout: () => void;
}

const normalizeRole = (role: string): "superadmin" | "owner" | "staff" | "trainer" | "member" => {
  if (role === "super_admin" || role === "superadmin") return "superadmin";
  if (role === "gym_admin" || role === "owner") return "owner";
  if (role === "staff") return "staff";
  if (role === "trainer") return "trainer";
  return "member";
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => {
        const normalizedUser = user ? { ...user, role: normalizeRole(user.role) } : null;
        set({ user: normalizedUser, token, isAuthenticated: true });
        if (normalizedUser && normalizedUser.gymId) {
          useGymStore.getState().setSelectedGymId(normalizedUser.gymId);
        }
      },
      setUser: (user) => {
        const normalizedUser = user ? { ...user, role: normalizeRole(user.role) } : null;
        set({ user: normalizedUser });
        if (normalizedUser && normalizedUser.gymId) {
          useGymStore.getState().setSelectedGymId(normalizedUser.gymId);
        }
      },
      setToken: (token) => {
        set({ token, isAuthenticated: true });
      },
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        useGymStore.getState().clearGymFeatures();
        queryClient.clear();
      },
    }),
    {
      name: "kybergym-auth",
      storage: createJSONStorage(() => secureStorage),
    }
  )
);
