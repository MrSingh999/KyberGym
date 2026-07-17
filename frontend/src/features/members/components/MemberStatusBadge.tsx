import React from "react";
import { MembershipStatus } from "../types";
import { User } from "lucide-react";

interface MemberStatusBadgeProps {
  status: MembershipStatus;
  className?: string;
}

const statusConfig: Record<MembershipStatus, {
  label: string;
  dotClass: string;
  badgeClass: string;
}> = {
  "Active": {
    label: "Active",
    dotClass: "status-dot-active",
    badgeClass: "text-success bg-success/10 border-success/20",
  },
  "Expiring Soon": {
    label: "Due Soon",
    dotClass: "status-dot-due",
    badgeClass: "text-warning bg-warning/10 border-warning/20",
  },
  "Expired": {
    label: "Overdue",
    dotClass: "status-dot-overdue",
    badgeClass: "text-error bg-error/10 border-error/20",
  },
  "Suspended": {
    label: "Inactive",
    dotClass: "",
    badgeClass: "text-text-muted bg-surface border-border-default",
  },
};

export function MemberStatusBadge({ status, className }: MemberStatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig["Suspended"];

  return (
    <span
      className={`inline-flex items-center space-x-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full border w-fit ${config.badgeClass} ${className ?? ""}`}
    >
      {config.dotClass ? (
        <span className={`status-dot ${config.dotClass}`} />
      ) : (
        <User className="h-3 w-3 shrink-0" />
      )}
      <span>{config.label}</span>
    </span>
  );
}
