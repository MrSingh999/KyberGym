import React from "react";
import { MembershipStatus } from "../types";

interface MemberStatusBadgeProps {
  status: MembershipStatus;
  className?: string;
}

const statusConfig: Record<MembershipStatus, {
  dotClass: string;
  textClass: string;
  bgClass: string;
  borderClass: string;
}> = {
  "Active": {
    dotClass: "status-dot status-dot-active",
    textClass: "text-emerald-600 dark:text-emerald-400",
    bgClass: "bg-emerald-500/10",
    borderClass: "border-emerald-500/20",
  },
  "Expiring Soon": {
    dotClass: "status-dot status-dot-due",
    textClass: "text-amber-600 dark:text-amber-400",
    bgClass: "bg-amber-500/10",
    borderClass: "border-amber-500/20",
  },
  "Expired": {
    dotClass: "status-dot status-dot-overdue",
    textClass: "text-red-600 dark:text-red-400",
    bgClass: "bg-red-500/10",
    borderClass: "border-red-500/20",
  },
  "Suspended": {
    dotClass: "status-dot bg-zinc-400",
    textClass: "text-zinc-500 dark:text-zinc-400",
    bgClass: "bg-zinc-500/10",
    borderClass: "border-zinc-500/20",
  },
};

export function MemberStatusBadge({ status, className }: MemberStatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig["Suspended"];

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full border font-mono ${config.bgClass} ${config.textClass} ${config.borderClass} ${className ?? ""}`}
    >
      <span className={config.dotClass} />
      {status}
    </span>
  );
}
