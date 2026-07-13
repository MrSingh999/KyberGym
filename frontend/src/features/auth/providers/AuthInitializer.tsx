import React, { useEffect, useState } from "react";
import { useAuthStore } from "../../../store/auth.store";
import { apiClient } from "../../../lib/apiClient";

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { token, login, logout } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let active = true;

    const initializeAuth = async () => {
      if (!token) {
        if (active) {
          logout();
          setIsInitializing(false);
        }
        return;
      }

      try {
        const response = await apiClient.get(`/auth/me`);
        const user = response.data.data.user;
        if (active) {
          login(user, token);
          setIsInitializing(false);
        }
      } catch (error: any) {
        console.error("Session restoration failed:", error);
        if (active) {
          logout();
          setIsInitializing(false);
        }
      }
    };

    initializeAuth();

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
