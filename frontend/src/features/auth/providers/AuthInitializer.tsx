import { useEffect, useState, useRef } from "react";
import { useAuthStore } from "../../../store/auth.store";
import { authApi } from "../api/auth.api";

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { token, login, logout } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);
  const isRestoring = useRef(false);

  useEffect(() => {
    let active = true;

    const restoreSession = async () => {
      if (!token) {
        if (active) setIsInitializing(false);
        return;
      }

      if (isRestoring.current) return;
      isRestoring.current = true;

      try {
        const user = await authApi.getMe();
        if (active) login(user, token);
      } catch {
        if (active) logout();
      } finally {
        isRestoring.current = false;
        if (active) setIsInitializing(false);
      }
    };

    restoreSession();

    return () => {
      active = false;
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
