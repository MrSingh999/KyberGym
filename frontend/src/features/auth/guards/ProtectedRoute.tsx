import React from "react";
import { Navigate, useLocation } from "react-router";
import { useAuthStore } from "../../../store/auth.store";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login but save the attempted URL for post-login redirection
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

export function PublicRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  if (isAuthenticated) {
    // If user is already logged in, prevent them from accessing /login or /register
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
}
