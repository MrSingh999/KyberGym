import React, { useEffect } from "react";
import { useAuthStore } from "../../../store/auth.store";
import { useCurrentUser } from "../hooks/useCurrentUser";

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const { data: user, isLoading, isError } = useCurrentUser();

  useEffect(() => {
    // If the backend says the user is unauthorized/invalid, logout and clear state
    if (isError && isAuthenticated) {
      useAuthStore.getState().logout();
    }
  }, [isError, isAuthenticated]);

  if (isAuthenticated && isLoading) {
    // Render full page auth loader while we verify the session
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
