import React from "react";
import { Users } from "lucide-react";
import { WidgetContainer } from "@/features/dashboard/widgets/WidgetContainer";
import { WidgetHeader } from "@/features/dashboard/widgets/WidgetHeader";
import { WidgetBody } from "@/features/dashboard/widgets/WidgetBody";
import { WidgetEmptyState } from "@/features/dashboard/widgets/WidgetEmptyState";
import { MetricCard } from "@/components/data-display/MetricCard";
import { AttendanceStats } from "../types";
import { cn } from "@/lib/utils";

interface AttendanceDashboardProps {
  stats?: AttendanceStats;
  isLoading: boolean;
}

export function AttendanceDashboard({
  stats,
  isLoading,
}: AttendanceDashboardProps) {
  if (!stats && !isLoading) {
    return (
      <WidgetContainer>
        <WidgetHeader title="Attendance Overview" />
        <WidgetBody>
          <WidgetEmptyState
            title="No attendance data"
            description="Attendance statistics will appear once records are created."
            icon={<Users className="h-6 w-6 text-muted" />}
          />
        </WidgetBody>
      </WidgetContainer>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <StatCard
        title="Today"
        total={stats?.today.total ?? 0}
        present={stats?.today.present ?? 0}
        absent={stats?.today.absent ?? 0}
        late={stats?.today.late ?? 0}
        percentage={stats?.today.percentage ?? 0}
        isLoading={isLoading}
      />
      <StatCard
        title="This Week"
        total={stats?.week.total ?? 0}
        present={stats?.week.present ?? 0}
        absent={stats?.week.absent ?? 0}
        late={stats?.week.late ?? 0}
        percentage={stats?.week.percentage ?? 0}
        isLoading={isLoading}
      />
      <StatCard
        title="This Month"
        total={stats?.month.total ?? 0}
        present={stats?.month.present ?? 0}
        absent={stats?.month.absent ?? 0}
        late={stats?.month.late ?? 0}
        percentage={stats?.month.percentage ?? 0}
        isLoading={isLoading}
        mostActive={stats?.month.mostActive}
      />
    </div>
  );
}

function StatCard({
  title,
  total,
  present,
  absent,
  late,
  percentage,
  isLoading,
  mostActive,
}: {
  title: string;
  total: number;
  present: number;
  absent: number;
  late: number;
  percentage: number;
  isLoading: boolean;
  mostActive?: { memberName: string; count: number }[];
}) {
  if (isLoading) {
    return (
      <div className="glass-card rounded-[12px] p-5 space-y-4 animate-pulse">
        <div className="h-5 w-24 bg-surface-hover rounded" />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-16 bg-surface-hover rounded" />
              <div className="h-6 w-12 bg-surface-hover rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-[12px] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-base text-text-primary font-mono uppercase tracking-wide">
          {title}
        </h3>
        <span
          className={cn(
            "text-sm font-bold font-mono",
            percentage >= 80
              ? "text-emerald-500"
              : percentage >= 50
              ? "text-amber-500"
              : "text-red-500"
          )}
        >
          {percentage}%
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <MetricCard label="Total" value={String(total)} />
        <MetricCard label="Present" value={String(present)} />
        <MetricCard label="Absent" value={String(absent)} />
        <MetricCard label="Late" value={String(late)} />
      </div>

      {mostActive && mostActive.length > 0 && (
        <div className="pt-3 border-t border-border-default/40 space-y-2">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider font-mono">
            Most Active
          </p>
          {mostActive.slice(0, 3).map((m, i) => (
            <div
              key={i}
              className="flex items-center justify-between text-xs"
            >
              <span className="text-text-primary font-medium truncate mr-2">
                {m.memberName}
              </span>
              <span className="text-text-muted font-mono shrink-0">
                {m.count} visits
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
