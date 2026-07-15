import React from "react";
import { useCurrentTenant } from "../../tenant/hooks/useCurrentTenant";

export function TenantInitializer({ children }: { children: React.ReactNode }) {
  useCurrentTenant();

  return <>{children}</>;
}
