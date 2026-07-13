import React from "react";
import { Badge } from "@/components/ui/badge";
import { MembershipStatus } from "../types";

interface MemberStatusBadgeProps {
  status: MembershipStatus;
  className?: string;
}

const statusConfig: Record<MembershipStatus, { variant: "success" | "warning" | "destructive" | "default" }> = {
  "Active": { variant: "success" },
  "Expiring Soon": { variant: "warning" },
  "Expired": { variant: "destructive" },
  "Suspended": { variant: "default" },
};

export function MemberStatusBadge({ status, className }: MemberStatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge variant={config.variant} className={className}>
      {status}
    </Badge>
  );
}
