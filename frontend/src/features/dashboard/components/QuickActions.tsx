import React from "react";
import { UserPlus, CreditCard, RefreshCw, Dumbbell, BarChart3 } from "lucide-react";
import { cn } from "../../../../lib/utils";

const actions = [
  { label: "Add Member", icon: UserPlus, color: "text-primary", bg: "bg-primary/10" },
  { label: "Collect Payment", icon: CreditCard, color: "text-success", bg: "bg-success/10" },
  { label: "Renew Plan", icon: RefreshCw, color: "text-warning", bg: "bg-warning/10" },
  { label: "Assign Workout", icon: Dumbbell, color: "text-error", bg: "bg-error/10" },
  { label: "Open Reports", icon: BarChart3, color: "text-secondary", bg: "bg-surface-hover" },
];

export function QuickActions() {
  return (
    <div className="mb-8">
      <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Quick Actions</h2>
      
      {/* Mobile: 2-column grid. Desktop: horizontal scroll/wrap */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:flex lg:flex-wrap gap-3">
        {actions.map((action) => (
          <button
            key={action.label}
            className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-default hover:border-hover hover:shadow-sm transition-all text-left touch-target active:scale-[0.98]"
          >
            <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", action.bg, action.color)}>
              <action.icon className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium text-primary leading-tight">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
