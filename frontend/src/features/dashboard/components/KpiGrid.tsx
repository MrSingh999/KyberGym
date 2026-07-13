import React from "react";
import CountUp from "react-countup";
import { Users, Activity, DollarSign, CalendarCheck } from "lucide-react";
import { StatCard } from "@/components/data-display/StatCard";
import { useDashboardStats } from "../hooks/useDashboardStats";

export function KpiGrid() {
  const { data: stats, isLoading } = useDashboardStats();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard
        title="Total Members"
        value={
          <CountUp end={stats?.totalMembers || 0} duration={2} separator="," />
        }
        icon={<Users className="h-5 w-5" />}
        trend={stats?.trends.members}
        trendLabel="vs last month"
        loading={isLoading}
      />
      <StatCard
        title="Active Members"
        value={
          <CountUp end={stats?.activeMembers || 0} duration={2} separator="," />
        }
        icon={<Activity className="h-5 w-5 text-success" />}
        loading={isLoading}
      />
      <StatCard
        title="Monthly Revenue"
        value={
          <CountUp prefix="$" end={stats?.monthlyRevenue || 0} duration={2.5} separator="," />
        }
        icon={<DollarSign className="h-5 w-5" />}
        trend={stats?.trends.revenue}
        trendLabel="vs last month"
        loading={isLoading}
      />
      <StatCard
        title="Pending Renewals"
        value={
          <CountUp end={stats?.pendingRenewals || 0} duration={1.5} />
        }
        icon={<CalendarCheck className="h-5 w-5 text-warning" />}
        loading={isLoading}
      />
    </div>
  );
}
