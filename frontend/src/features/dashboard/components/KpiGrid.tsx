import { useMemo } from "react";
import CountUp from "react-countup";
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
      icon: <Users className="h-3.5 w-3.5" />,
      color: "border-l-zinc-500 dark:border-l-zinc-400",
    },
    {
      title: "Active Members",
      value: stats?.activeMembers ?? 0,
      icon: <UserCheck className="h-3.5 w-3.5 text-emerald-500" />,
      color: "border-l-emerald-500",
    },
    {
      title: "Inactive Members",
      value: stats?.inactiveMembers ?? 0,
      icon: <UserX className="h-3.5 w-3.5 text-text-muted" />,
      color: "border-l-zinc-400",
    },
    {
      title: "Overdue",
      value: stats?.expiredMembers ?? 0,
      icon: <AlertTriangle className="h-3.5 w-3.5 text-red-500" />,
      color: "border-l-red-500",
    },
    {
      title: "Due Today",
      value: dues?.dueToday?.length ?? 0,
      icon: <Calendar className="h-3.5 w-3.5 text-rose-500" />,
      color: "border-l-rose-500",
    },
    {
      title: "Due in 3 Days",
      value: dues?.dueIn3Days?.length ?? 0,
      icon: <CalendarDays className="h-3.5 w-3.5 text-orange-500" />,
      color: "border-l-orange-500",
    },
    {
      title: "Due in 7 Days",
      value: dues?.dueIn7Days?.length ?? 0,
      icon: <CalendarRange className="h-3.5 w-3.5 text-amber-500" />,
      color: "border-l-amber-500",
    },
    {
      title: "Monthly Revenue",
      value: stats?.monthlyCollection ?? 0,
      prefix: "₹",
      icon: <TrendingUp className="h-3.5 w-3.5" />,
      color: "border-l-zinc-800 dark:border-l-zinc-600",
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
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-8 gap-3">
      {cards.map((card) => (
        <StatCard
          key={card.title}
          title={card.title}
          value={
            <CountUp
              end={card.value}
              duration={1.5}
              separator=","
              prefix={card.prefix ?? ""}
            />
          }
          icon={card.icon}
          loading={isLoading}
          className={cn(
            "rounded-[12px] border-l-[3px]",
            card.color,
            (card.title === "Due Today" || card.title === "Overdue") &&
              "cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all duration-200",
          )}
        />
      ))}
    </div>
  );
}
