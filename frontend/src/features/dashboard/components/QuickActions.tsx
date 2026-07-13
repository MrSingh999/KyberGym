import React from "react";
import { UserPlus, CreditCard, RefreshCw, Dumbbell, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router";

const actions = [
  { label: "Add Member", icon: UserPlus, href: "/admin/members" },
  { label: "Collect Payment", icon: CreditCard, href: "/admin/payments/collect" },
  { label: "Renew Plan", icon: RefreshCw, href: "/admin/plans" },
  { label: "Assign Workout", icon: Dumbbell, href: "/admin/workouts" },
  { label: "Open Reports", icon: BarChart3, href: "/admin/reports" },
];

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <div className="mb-6">
      <h2 className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-3 font-mono">
        Quick Diagnostics & Actions
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:flex lg:flex-wrap gap-2.5">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={() => navigate(action.href)}
            className="flex items-center gap-3 p-3 rounded-lg bg-surface border border-border-default hover:border-border-hover hover:bg-surface-hover/30 hover:shadow-sm transition-all text-left cursor-pointer group active:scale-[0.98] lg:min-w-[170px]"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] bg-elevated border border-border-default text-text-secondary group-hover:text-text-primary transition-colors">
              <action.icon className="h-4 w-4" />
            </div>
            <span className="text-xs font-mono uppercase tracking-wider font-semibold text-text-primary leading-tight">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
