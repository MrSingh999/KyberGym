import React from "react";
import { DueStatus } from "../types";
import { cn } from "@/lib/utils";
import { AlertTriangle, AlertCircle } from "lucide-react";

interface DueBadgeProps {
  status: DueStatus;
  className?: string;
}

const config: Record<DueStatus, { label: string; icon: React.ElementType; badgeClass: string }> = {
  due_soon: {
    label: "Due Soon",
    icon: AlertTriangle,
    badgeClass: "text-warning bg-warning/10 border-warning/20",
  },
  overdue: {
    label: "Overdue",
    icon: AlertCircle,
    badgeClass: "text-error bg-error/10 border-error/20",
  },
};

export function DueBadge({ status, className }: DueBadgeProps) {
  const c = config[status];
  const Icon = c.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border w-fit",
        c.badgeClass,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      <span>{c.label}</span>
    </span>
  );
}
