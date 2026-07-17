import React from "react";
import { MembershipStatus } from "../types";
import { cn } from "@/lib/utils";

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
    dotClass: "bg-success",
    badgeClass: "text-success bg-success/10 border-success/20",
  },
  "Suspended": {
    label: "Suspended",
    dotClass: "",
    badgeClass: "text-warning bg-warning/10 border-warning/20",
  },
  "Inactive": {
    label: "Inactive",
    dotClass: "",
    badgeClass: "text-text-muted bg-surface border-border-default",
  },
};

export function MemberStatusBadge({ status, className }: MemberStatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig["Inactive"];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full border w-fit",
        config.badgeClass,
        className
      )}
    >
      {config.dotClass ? (
        <span className={cn("h-1.5 w-1.5 rounded-full", config.dotClass)} />
      ) : (
        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-40" />
      )}
      <span>{config.label}</span>
    </span>
  );
}
