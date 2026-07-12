import React from "react";
import { useGymStore } from "../../../store/gym.store";
import { useCurrentTenant } from "../../tenant/hooks/useCurrentTenant";

export function TenantInitializer({ children }: { children: React.ReactNode }) {
  const { selectedGymId } = useGymStore();
  
  // This aggressively prefetches the tenant data into the TanStack cache
  // as early as possible so that TenantGuard and subsequent pages don't block.
  useCurrentTenant();

  return <>{children}</>;
}
