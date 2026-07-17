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

  const cards = useMemo(() => [
    {
      title: "Total Members",
      value: stats?.totalMembers ?? 0,
      icon: <Users className="h-4 w-4" />,
      color: "bg-primary/10 text-primary",
    },
    {
      title: "Active Members",
      value: stats?.activeMembers ?? 0,
      icon: <UserCheck className="h-4 w-4" />,
      color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Inactive Members",
      value: stats?.inactiveMembers ?? 0,
      icon: <UserX className="h-4 w-4" />,
      color: "bg-zinc-500/10 dark:bg-zinc-500/15 text-zinc-500 dark:text-zinc-400",
    },
    {
      title: "Overdue",
      value: dues?.overdue?.length ?? 0,
      icon: <AlertTriangle className="h-4 w-4" />,
      color: "bg-red-500/10 text-red-600 dark:text-red-400",
    },
    {
      title: "Due Today",
      value: dues?.dueToday?.length ?? 0,
      icon: <Calendar className="h-4 w-4" />,
      color: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    },
    {
      title: "Due in 3 Days",
      value: dues?.dueIn3Days?.length ?? 0,
      icon: <CalendarDays className="h-4 w-4" />,
      color: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    },
    {
      title: "Due in 7 Days",
      value: dues?.dueIn7Days?.length ?? 0,
      icon: <CalendarRange className="h-4 w-4" />,
      color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
    {
      title: "Monthly Revenue",
      value: stats?.monthlyCollection ?? 0,
      prefix: "₹",
      icon: <TrendingUp className="h-4 w-4" />,
      color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    },
  ], [stats, dues]);

  if (hasError && !isLoading) {
    return (
      <div className="glass-panel rounded-[16px] p-6">
        <ErrorState
          title="Failed to load dashboard data"
          message={statsError?.message || "Could not retrieve key metrics."}
          onRetry={() => { refetchStats(); refetchDues(); }}
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <StatCard
          key={card.title}
          title={card.title}
          value={card.prefix ? `${card.prefix}${card.value.toLocaleString()}` : card.value.toLocaleString()}
          icon={card.icon}
          iconClassName={card.color}
          loading={isLoading}
          className={cn(
            "rounded-[12px]",
            (card.title === "Due Today" || card.title === "Overdue") &&
              "cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all duration-200",
          )}
        />
      ))}
    </div>
  );
}
