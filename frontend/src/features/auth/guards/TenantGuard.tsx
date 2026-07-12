import React from "react";
import { Navigate } from "react-router";
import { useGymStore } from "../../../store/gym.store";
import { useCurrentTenant } from "../../tenant/hooks/useCurrentTenant";
import { Skeleton } from "../../../components/feedback/Skeleton";

interface TenantGuardProps {
  children: React.ReactNode;
}

export function TenantGuard({ children }: TenantGuardProps) {
  const { selectedGymId } = useGymStore();
  const { data: tenant, isLoading, isError } = useCurrentTenant();

  // 1. Check if a gym is even selected in local state
  if (!selectedGymId) {
    return <Navigate to="/gyms/select" replace />;
  }

  // 2. While fetching the full tenant profile, show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center p-4">
        <Skeleton className="h-12 w-12 rounded-full mb-4" />
        <Skeleton className="h-4 w-48 mb-2" />
        <Skeleton className="h-3 w-32" />
      </div>
    );
  }

  // 3. If the backend rejects the gymId (user removed, deleted gym)
  if (isError || !tenant) {
    return <Navigate to="/tenant-not-found" replace />;
  }

  return <>{children}</>;
}
