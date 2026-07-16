import { useEffect, useState } from "react";
import axios from "axios";
import { useAuthStore } from "../../../store/auth.store";
import { authApi } from "../api/auth.api";

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { token, login, logout } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(() => !!token);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const restoreSession = async () => {
      if (!token) {
        if (active) setIsInitializing(false);
        return;
      }

      try {
        const user = await authApi.getMe({ signal: controller.signal });
        if (active) login(user, token);
      } catch (err) {
        if (active && !axios.isCancel(err)) {
          logout();
        }
      } finally {
        if (active) setIsInitializing(false);
      }
    };

    restoreSession();

    return () => {
      active = false;
      controller.abort();
    };
  }, [token, login, logout]);

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
