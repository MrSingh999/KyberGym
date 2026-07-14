import reactCountUp from "react-countup";
import { Users, AlertTriangle, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/data-display/StatCard";
import { ErrorState } from "@/components/feedback/ErrorState";
import { useDashboardStats } from "../hooks/useDashboardStats";
import { useDashboardDues } from "../hooks/useDashboardDues";

const CountUp = (reactCountUp as any).default || reactCountUp;

interface KpiGridProps {
  activeFilter?: "all" | "overdue" | "due";
  onFilterChange?: (filter: "all" | "overdue" | "due") => void;
}

export function KpiGrid({ activeFilter = "all", onFilterChange }: KpiGridProps) {
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

  if (hasError && !isLoading) {
    return (
      <div className="glass-panel rounded-[16px] p-6">
        <ErrorState
          title="Failed to load dashboard data"
          message={statsError?.message || "Could not retrieve key metrics. Please try again."}
          onRetry={() => {
            refetchStats();
            refetchDues();
          }}
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      <StatCard
        title="Total Members"
        value={<CountUp end={stats?.totalMembers || 0} duration={1.5} separator="," />}
        icon={<Users className="h-3.5 w-3.5" />}
        loading={isLoading}
        className="rounded-[12px] border-l-[3px] border-l-zinc-500 dark:border-l-zinc-400"
      />
      <StatCard
        title="Active"
        value={<CountUp end={stats?.activeMembers || 0} duration={1.5} separator="," />}
        icon={<CheckCircle className="h-3.5 w-3.5 text-emerald-500" />}
        loading={isLoading}
        className="rounded-[12px] border-l-[3px] border-l-zinc-300 dark:border-l-zinc-200"
      />
      <StatCard
        title="Overdue"
        value={<CountUp end={stats?.expiredMembers || 0} duration={1.5} separator="," />}
        icon={<AlertTriangle className="h-3.5 w-3.5 text-red-500" />}
        loading={isLoading}
        onClick={() => onFilterChange?.(activeFilter === "overdue" ? "all" : "overdue")}
        className={`rounded-[12px] border-l-[3px] border-l-red-500 cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 ${
          activeFilter === "overdue" ? "ring-1 ring-text-primary/30 bg-surface-hover/30" : ""
        }`}
      />
      <StatCard
        title="Due soon"
        value={<CountUp end={dues?.dueIn7Days?.length || 0} duration={1.5} separator="," />}
        icon={<Clock className="h-3.5 w-3.5 text-amber-500" />}
        loading={isLoading}
        onClick={() => onFilterChange?.(activeFilter === "due" ? "all" : "due")}
        className={`rounded-[12px] border-l-[3px] border-l-amber-500 cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 ${
          activeFilter === "due" ? "ring-1 ring-text-primary/30 bg-surface-hover/30" : ""
        }`}
      />
      <StatCard
        title="Monthly Rev"
        value={<CountUp prefix="₹" end={stats?.monthlyCollection || 0} duration={2} separator="," />}
        icon={<TrendingUp className="h-3.5 w-3.5" />}
        loading={isLoading}
        className="rounded-[12px] border-l-[3px] border-l-zinc-800 dark:border-l-zinc-600 col-span-2 md:col-span-1 lg:col-span-1"
      />
    </div>
  );
}
