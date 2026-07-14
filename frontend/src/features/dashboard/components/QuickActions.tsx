import {
  UserPlus,
  CreditCard,
  RefreshCw,
  Dumbbell,
  ClipboardCheck,
  Users,
  Settings,
  BarChart3,
} from "lucide-react";
import { useNavigate } from "react-router";

const actions = [
  { label: "Add Member", icon: UserPlus, href: "/admin/members" },
  { label: "Record Payment", icon: CreditCard, href: "/admin/payments/collect" },
  { label: "Renew Membership", icon: RefreshCw, href: "/admin/plans" },
  { label: "Manage Workouts", icon: Dumbbell, href: "/admin/workouts" },
  { label: "Record Attendance", icon: ClipboardCheck, href: "/admin/qr" },
  { label: "Manage Staff", icon: Users, href: "/admin/staff" },
  { label: "Open Reports", icon: BarChart3, href: "/admin/reports" },
  { label: "Settings", icon: Settings, href: "/admin/settings" },
];

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <div>
      <h2 className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-3 font-mono">
        Quick Actions
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:flex lg:flex-wrap gap-2.5">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={() => navigate(action.href)}
            className="flex items-center gap-3 p-3 rounded-lg bg-surface border border-border-default hover:border-border-hover hover:bg-surface-hover/30 hover:shadow-sm transition-all text-left cursor-pointer group active:scale-[0.98] lg:min-w-[160px] flex-1"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] bg-elevated border border-border-default text-text-muted group-hover:text-text-primary transition-colors">
              <action.icon className="h-3.5 w-3.5" />
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
