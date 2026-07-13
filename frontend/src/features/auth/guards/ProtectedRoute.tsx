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
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (isAuthenticated && user) {
    let from = location.state?.from?.pathname;
    const isSpecialPath = !from || from === "/" || from === "/login" || from === "/register" || from === "/unauthorized";
    
    if (isSpecialPath) {
      if (user.role === "superadmin") {
        from = "/super-admin/dashboard";
      } else if (user.role === "owner") {
        from = "/admin/dashboard";
      } else {
        from = "/member/dashboard";
      }
    }

    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
}
