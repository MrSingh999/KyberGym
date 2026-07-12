import React from "react";
import { Navigate } from "react-router";
import { useHasPermission, Permission, usePermissions } from "../hooks/usePermissions";
import { Skeleton } from "../../../components/feedback/Skeleton";

interface PermissionGuardProps {
  children: React.ReactNode;
  permission: Permission;
  fallback?: React.ReactNode;
}

export function PermissionGuard({ children, permission, fallback }: PermissionGuardProps) {
  const { isLoading } = usePermissions();
  const hasPermission = useHasPermission(permission);

  if (isLoading) {
    return <Skeleton className="h-10 w-full" />;
  }

  if (!hasPermission) {
    if (fallback) return <>{fallback}</>;
    return <Navigate to="/access-denied" replace />;
  }

  return <>{children}</>;
}
