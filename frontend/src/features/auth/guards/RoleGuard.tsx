import React from "react";
import { Navigate } from "react-router";
import { useAuthStore } from "../../../store/auth.store";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: Array<"superadmin" | "owner" | "staff" | "member">;
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user } = useAuthStore();

  if (!user || !allowedRoles.includes(user.role)) {
    // Render the unauthorized error state or simply redirect to a safe page
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
