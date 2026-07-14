import { cn } from "@/lib/utils";
import { useNavigate } from "react-router";
import { Building2, Users, Activity, AlertTriangle, Clock, CreditCard, Plus, Eye, Settings as SettingsIcon } from "lucide-react";
import { useSADashboard, useSAGyms } from "../hooks/useSuperAdmin";
import { Skeleton } from "@/components/feedback/Skeleton";
import { ErrorState } from "@/components/feedback/ErrorState";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const statusColor: Record<string, "success" | "warning" | "destructive" | "secondary"> = {
  active: "success",
  trial: "warning",
  expired: "destructive",
  suspended: "secondary",
};

function StatCard({ label, value, icon, color, isLoading }: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  isLoading: boolean;
}) {
  const Icon = icon;
  return (
    <div className="rounded-xl border border-border-default bg-surface p-4 sm:p-5 hover:border-border-hover transition-all duration-200 card-hover">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", color)}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wide font-mono leading-tight sm:leading-none">
          {label}
        </span>
      </div>
      {isLoading ? (
        <Skeleton className="h-8 w-16" />
      ) : (
        <p className="text-2xl font-bold text-text-primary font-mono tracking-tight leading-none">
          {value.toLocaleString()}
        </p>
      )}
    </div>
  );
}

export function SuperAdminDashboardPage() {
  const navigate = useNavigate();
  const {
    data: stats,
    isLoading: isStatsLoading,
    isError: isStatsError,
    error: statsError,
    refetch: refetchStats,
  } = useSADashboard();

  const {
    data: gymsData,
    isLoading: isGymsLoading,
    isError: isGymsError,
    refetch: refetchGyms,
  } = useSAGyms({ page: 1, limit: 5 });

  const recentGyms = gymsData?.data ?? [];
  const isLoading = isStatsLoading || isGymsLoading;
  const hasError = isStatsError || isGymsError;

  const statCards = [
    { label: "Total Gyms", value: stats?.totalGyms ?? 0, icon: Building2, color: "bg-primary/10 text-primary" },
    { label: "Active Gyms", value: stats?.activeGyms ?? 0, icon: Activity, color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
    { label: "Trial Gyms", value: stats?.trialGyms ?? 0, icon: Clock, color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
    { label: "Suspended", value: stats?.suspendedGyms ?? 0, icon: AlertTriangle, color: "bg-red-500/10 text-red-600 dark:text-red-400" },
    { label: "Total Members", value: stats?.totalMembers ?? 0, icon: Users, color: "bg-purple-500/10 text-purple-600 dark:text-purple-400" },
    { label: "Active Subs", value: stats?.activeSubscriptions ?? 0, icon: CreditCard, color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400" },
    { label: "Expired Subs", value: stats?.expiredSubscriptions ?? 0, icon: CreditCard, color: "bg-zinc-500/10 dark:bg-zinc-500/15 text-zinc-600 dark:text-zinc-400" },
  ];

  const quickActions = [
    { label: "Create Gym", icon: Plus, href: "/super-admin/gyms", onClick: () => navigate("/super-admin/gyms") },
    { label: "View All Gyms", icon: Eye, href: "/super-admin/gyms", onClick: () => navigate("/super-admin/gyms") },
    { label: "Settings", icon: SettingsIcon, href: "/super-admin/settings", onClick: () => navigate("/super-admin/settings") },
  ];

  return (
    <div className="flex-1 w-full max-w-[1600px] mx-auto animate-fade-slide-up">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="font-bold text-xl sm:text-2xl text-text-primary tracking-tight">
            Super Admin <span className="text-text-secondary font-normal ml-0.5">Dashboard</span>
          </h1>
          <p className="text-text-secondary mt-1 text-xs font-mono">
            Platform-wide overview of all gyms, members, and subscriptions.
          </p>
        </div>
        <Button
          onClick={() => navigate("/super-admin/gyms")}
          className="w-full sm:w-auto bg-primary text-primary-foreground px-4 py-2 rounded-[6px] font-semibold text-xs flex items-center gap-2 cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Create Gym</span>
        </Button>
      </div>

      {/* Error State */}
      {hasError && !isLoading ? (
        <div className="glass-panel rounded-[16px] p-6">
          <ErrorState
            title="Failed to load dashboard"
            message={statsError?.message || "Could not retrieve platform data."}
            onRetry={() => { refetchStats(); refetchGyms(); }}
          />
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3 mb-8">
            {statCards.map((card) => (
              <StatCard key={card.label} {...card} isLoading={isLoading} />
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-3 font-mono">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:flex sm:flex-wrap gap-2.5">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={action.onClick}
                  className="flex items-center gap-3 p-3 rounded-lg bg-surface border border-border-default hover:border-border-hover hover:bg-surface-hover/50 hover:shadow-sm transition-all duration-150 cursor-pointer group press-effect"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] bg-elevated border border-border-default text-text-muted group-hover:text-text-primary transition-colors duration-150">
                    <action.icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-mono uppercase tracking-wider font-semibold text-text-primary">
                    {action.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Recent Gyms */}
            <div className="lg:col-span-2">
              <div className="glass-panel rounded-[16px] p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-border-default pb-3">
                  <div>
                    <h2 className="font-bold text-base text-text-primary font-mono uppercase tracking-wide">
                      Recent Gyms
                    </h2>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Latest gym registrations on the platform.
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs font-semibold cursor-pointer"
                    onClick={() => navigate("/super-admin/gyms")}
                  >
                    View All
                  </Button>
                </div>

                {isGymsLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full rounded-xl" />
                    ))}
                  </div>
                ) : isGymsError ? (
                  <ErrorState
                    title="Failed to load"
                    message="Could not load recent gyms"
                    onRetry={() => refetchGyms()}
                  />
                ) : recentGyms.length === 0 ? (
                  <EmptyState
                    icon={<Building2 className="w-8 h-8" />}
                    title="No gyms registered"
                    description="Create your first gym to get started."
                    actionLabel="Create Gym"
                    onAction={() => navigate("/super-admin/gyms")}
                  />
                ) : (
                  <div className="space-y-1.5">
                    {recentGyms.map((gym) => (
                      <div
                        key={gym.id}
                        onClick={() => navigate(`/super-admin/gyms/${gym.id}`)}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border border-border-default hover:border-border-hover hover:bg-surface-hover/50 hover:shadow-sm transition-all duration-150 cursor-pointer group press-effect gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1 w-full">
                          <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 transition-transform duration-150 group-hover:scale-105">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-semibold text-text-primary truncate group-hover:text-primary transition-colors duration-150">
                              {gym.name}
                            </span>
                            <span className="text-[10px] text-text-muted font-mono">
                              {gym.subdomain || "-"}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 w-full sm:w-auto sm:justify-end">
                          <Badge
                            variant={gym.isActive ? "success" : "secondary"}
                            className="text-[10px] px-2 py-0.5"
                          >
                            {gym.isActive ? "Active" : "Suspended"}
                          </Badge>
                          <Badge
                            variant={statusColor[gym.subscriptionStatus] || "secondary"}
                            className="text-[10px] px-2 py-0.5"
                          >
                            {gym.subscriptionStatus}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Platform Summary */}
            <div className="lg:col-span-1">
              <div className="glass-panel rounded-[16px] p-5 space-y-4">
                <div className="border-b border-border-default pb-3">
                  <h2 className="font-bold text-base text-text-primary font-mono uppercase tracking-wide">
                    Platform Summary
                  </h2>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Key metrics at a glance.
                  </p>
                </div>

                {isStatsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full rounded-lg" />
                    ))}
                  </div>
                ) : !stats ? (
                  <EmptyState
                    icon={<Activity className="w-8 h-8" />}
                    title="No data"
                    description="Platform metrics will appear here."
                  />
                ) : (
                  <div className="divide-y divide-border-default/50">
                    <SummaryRow label="Total Gyms" value={stats.totalGyms} color="text-text-primary" />
                    <SummaryRow label="Active" value={stats.activeGyms} color="text-emerald-600 dark:text-emerald-400" />
                    <SummaryRow label="Trial" value={stats.trialGyms} color="text-amber-600 dark:text-amber-400" />
                    <SummaryRow label="Suspended" value={stats.suspendedGyms} color="text-red-600 dark:text-red-400" />
                    <SummaryRow label="Total Members" value={stats.totalMembers} color="text-purple-600 dark:text-purple-400" />
                    <SummaryRow label="Active Subscriptions" value={stats.activeSubscriptions} color="text-cyan-600 dark:text-cyan-400" />
                    <SummaryRow label="Expired Subscriptions" value={stats.expiredSubscriptions} color="text-text-muted" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SummaryRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 px-1">
      <span className="text-xs text-text-secondary font-mono">{label}</span>
      <span className={`text-sm font-bold font-mono tabular-nums ${color}`}>
        {value.toLocaleString()}
      </span>
    </div>
  );
}
