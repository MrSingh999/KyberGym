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
      <h2 className="text-[11px] sm:text-[10px] font-bold text-text-muted uppercase tracking-wider mb-3 font-mono">
        Quick Actions
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={() => navigate(action.href)}
            className="flex items-center gap-2.5 p-2.5 sm:p-2 rounded-lg bg-surface/50 border border-border-default/50 hover:border-border-hover hover:bg-surface-hover/50 hover:shadow-xs transition-all duration-300 text-left cursor-pointer group active:scale-[0.98] w-full min-h-[48px]"
          >
            <div className="flex h-8 w-8 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-[6px] bg-elevated border border-border-default text-text-muted group-hover:text-primary group-hover:border-primary/20 transition-all duration-300 shadow-xs">
              <action.icon className="h-4 w-4 sm:h-3.5 sm:w-3.5 transition-transform duration-300 group-hover:scale-105" />
            </div>
            <span className="text-[11px] sm:text-[10px] font-sans font-bold uppercase tracking-wider text-text-primary group-hover:text-primary transition-colors duration-300 leading-tight">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
