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
    badgeClass: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20 dark:border-emerald-500/15",
  },
  "Expiring Soon": {
    label: "Due Soon",
    dotClass: "status-dot-due",
    badgeClass: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20 dark:border-amber-500/15",
  },
  "Expired": {
    label: "Overdue",
    dotClass: "status-dot-overdue",
    badgeClass: "text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20 dark:border-red-500/15",
  },
  "Suspended": {
    label: "Inactive",
    dotClass: "",
    badgeClass: "text-text-muted bg-white/[0.03] border-border-default dark:border-border-default/40",
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
