import { useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  Users,
  UserCheck,
  UserX,
  AlertTriangle,
  Calendar,
  CalendarDays,
  CalendarRange,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { StatCard } from "@/components/data-display/StatCard";
import { ErrorState } from "@/components/feedback/ErrorState";
import { useDashboardStats } from "../hooks/useDashboardStats";
import { useDashboardDues } from "../hooks/useDashboardDues";

export function KpiGrid() {
  const {
    data: stats,
    isLoading: isStatsLoading,
    isError: isStatsError,
    error: statsError,
    refetch: refetchStats,
  } = useDashboardStats();
  const {
    data: dues,
    isLoading: isDuesLoading,
    isError: isDuesError,
    refetch: refetchDues,
  } = useDashboardDues();

  const isLoading = isStatsLoading || isDuesLoading;
  const hasError = isStatsError || isDuesError;

  const coreCards = useMemo(() => [
    {
      title: "Total Members",
      value: stats?.totalMembers ?? 0,
      icon: <Users className="h-4 w-4 sm:h-5 sm:w-5" />,
      color: "bg-primary/10 text-primary border border-primary/20",
      trend: "Active base",
      trendType: "neutral" as const,
    },
    {
      title: "Active Members",
      value: stats?.activeMembers ?? 0,
      icon: <UserCheck className="h-4 w-4 sm:h-5 sm:w-5" />,
      color: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
      trend: "Operational",
      trendType: "up" as const,
    },
    {
      title: "Monthly Revenue",
      value: stats?.monthlyCollection ?? 0,
      prefix: "₹",
      icon: <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />,
      color: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
      trend: "Collected",
      trendType: "up" as const,
    },
    {
      title: "Inactive Members",
      value: stats?.inactiveMembers ?? 0,
      icon: <UserX className="h-4 w-4 sm:h-5 sm:w-5" />,
      color: "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20",
      trend: "Retention",
      trendType: "neutral" as const,
    },
  ], [stats]);

  const urgencyCards = useMemo(() => [
    {
      title: "Overdue Dues",
      value: dues?.overdue?.length ?? 0,
      icon: <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />,
      color: "bg-red-500/10 text-red-500 border border-red-500/20",
      accent: "border-l-red-500",
      trend: "Critical",
      trendType: "down" as const,
    },
    {
      title: "Due Today",
      value: dues?.dueToday?.length ?? 0,
      icon: <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />,
      color: "bg-rose-500/10 text-rose-500 border border-rose-500/20",
      accent: "border-l-rose-500",
      trend: "Immediate",
      trendType: "down" as const,
    },
    {
      title: "Due in 3 Days",
      value: dues?.dueIn3Days?.length ?? 0,
      icon: <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5" />,
      color: "bg-orange-500/10 text-orange-500 border border-orange-500/20",
      accent: "border-l-orange-500",
      trend: "Upcoming",
      trendType: "neutral" as const,
    },
    {
      title: "Due in 7 Days",
      value: dues?.dueIn7Days?.length ?? 0,
      icon: <CalendarRange className="h-4 w-4 sm:h-5 sm:w-5" />,
      color: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
      accent: "border-l-amber-500",
      trend: "This week",
      trendType: "neutral" as const,
    },
  ], [dues]);

  if (hasError && !isLoading) {
    return (
      <div className="glass-panel rounded-2xl p-6">
        <ErrorState
          title="Failed to load dashboard data"
          message={statsError?.message || "Could not retrieve key metrics."}
          onRetry={() => { refetchStats(); refetchDues(); }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Tier 1: Primary Business Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {coreCards.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={card.prefix ? `${card.prefix}${card.value.toLocaleString()}` : card.value.toLocaleString()}
            icon={card.icon}
            iconClassName={card.color}
            loading={isLoading}
            trend={card.trend}
            trendType={card.trendType}
          />
        ))}
      </div>

      {/* Tier 2: Billing & Expirations Diagnostics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {urgencyCards.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={card.value.toLocaleString()}
            icon={card.icon}
            iconClassName={card.color}
            loading={isLoading}
            trend={card.trend}
            trendType={card.trendType}
            className={cn("border-l-4", card.accent)}
          />
        ))}
      </div>
    </div>
  );
}
