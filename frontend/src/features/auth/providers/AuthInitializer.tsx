import { useEffect, useState } from "react";
import axios from "axios";
import { useAuthStore } from "../../../store/auth.store";
import { useGymStore } from "../../../store/gym.store";
import { authApi } from "../api/auth.api";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { token, login, setToken, logout } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let active = true;

    const restoreSession = async () => {
      if (!token) {
        if (active) setIsInitializing(false);
        return;
      }

      try {
        const user = await authApi.getMe();
        if (active) login(user, token);
      } catch {
        try {
          const gymId = useGymStore.getState().selectedGymId;
          const refreshRes = await axios.post(
            `${API_URL}/auth/refresh-token`,
            {},
            {
              withCredentials: true,
              headers: gymId ? { "x-tenant-id": gymId } : undefined,
            }
          );
          const newToken = refreshRes.data.data.accessToken;
          setToken(newToken);

          const user = await authApi.getMe();
          if (active) login(user, newToken);
        } catch {
          if (active) logout();
        }
      } finally {
        if (active) setIsInitializing(false);
      }
    };

    restoreSession();

    return () => {
      active = false;
    };
  }, [token]);

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-default border-t-primary"></div>
          <p className="text-sm font-medium text-muted animate-pulse">Authenticating...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
