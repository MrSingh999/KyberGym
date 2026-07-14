import { Building2, Users, CreditCard, Activity, AlertTriangle, Clock } from "lucide-react";
import { useSADashboard } from "../hooks/useSuperAdmin";
import { Skeleton } from "@/components/feedback/Skeleton";

export function SuperAdminDashboardPage() {
  const { data: stats, isLoading } = useSADashboard();

  const cards = [
    { label: "Total Gyms", value: stats?.totalGyms ?? 0, icon: Building2, color: "bg-blue-500/10 text-blue-600" },
    { label: "Active Gyms", value: stats?.activeGyms ?? 0, icon: Activity, color: "bg-emerald-500/10 text-emerald-600" },
    { label: "Suspended", value: stats?.suspendedGyms ?? 0, icon: AlertTriangle, color: "bg-red-500/10 text-red-600" },
    { label: "Trial Gyms", value: stats?.trialGyms ?? 0, icon: Clock, color: "bg-amber-500/10 text-amber-600" },
    { label: "Total Members", value: stats?.totalMembers ?? 0, icon: Users, color: "bg-purple-500/10 text-purple-600" },
    { label: "Active Subs", value: stats?.activeSubscriptions ?? 0, icon: CreditCard, color: "bg-cyan-500/10 text-cyan-600" },
    { label: "Expired Subs", value: stats?.expiredSubscriptions ?? 0, icon: CreditCard, color: "bg-zinc-500/10 text-zinc-600" },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex-1 w-full max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-h2 font-heading font-bold text-primary">Super Admin Dashboard</h1>
        <p className="text-sm text-muted mt-1">Platform-wide overview of all gyms.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-default bg-surface p-5">
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card) => (
            <div key={card.label} className="rounded-xl border border-default bg-surface p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-8 h-8 rounded-lg ${card.color} flex items-center justify-center`}>
                  <card.icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium text-muted uppercase tracking-wide">{card.label}</span>
              </div>
              <p className="text-3xl font-bold text-primary">{card.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
