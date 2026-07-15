import React from "react";
import { Navigate } from "react-router";
import { useHasPermission, Permission } from "../hooks/usePermissions";

interface PermissionGuardProps {
  children: React.ReactNode;
  permission: Permission;
  fallback?: React.ReactNode;
}

export function PermissionGuard({ children, permission, fallback }: PermissionGuardProps) {
  const hasPermission = useHasPermission(permission);

  if (!hasPermission) {
    if (fallback) return <>{fallback}</>;
    return <Navigate to="/access-denied" replace />;
  }

  return <>{children}</>;
}
