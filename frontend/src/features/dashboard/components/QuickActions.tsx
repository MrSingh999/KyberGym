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
  { label: "Add Member", icon: UserPlus, href: "/admin/members", color: "text-primary bg-primary/10 border-primary/20" },
  { label: "Collect Payment", icon: CreditCard, href: "/admin/member-payments/collect", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  { label: "Renew Membership", icon: RefreshCw, href: "/admin/plans", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
  { label: "Manage Workouts", icon: Dumbbell, href: "/admin/workouts", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
  { label: "Attendance QR", icon: ClipboardCheck, href: "/admin/qr", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  { label: "Manage Staff", icon: Users, href: "/admin/staff", color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" },
  { label: "Reports", icon: BarChart3, href: "/admin/reports", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
  { label: "Settings", icon: Settings, href: "/admin/settings", color: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20" },
];

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <div className="space-y-2.5">
      <h2 className="text-xs font-bold text-text-muted uppercase tracking-wider font-mono px-1">
        Command Quick Actions
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 sm:gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              onClick={() => navigate(action.href)}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-surface/80 backdrop-blur-xs border border-border-default/80 hover:border-border-hover hover:shadow-md transition-all duration-200 text-left cursor-pointer group active:scale-[0.97] w-full min-h-[48px] touch-target"
            >
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-transform duration-200 group-hover:scale-110 ${action.color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-xs font-mono font-bold text-text-primary group-hover:text-primary transition-colors leading-tight truncate">
                {action.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
