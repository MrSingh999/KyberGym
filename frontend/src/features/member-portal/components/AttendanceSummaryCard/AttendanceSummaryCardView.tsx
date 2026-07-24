import { MetricsSkeleton } from "../common/Skeletons";
import { StatusBadge } from "../common/StatusBadge";
import { Calendar, Flame, CheckCircle2 } from "lucide-react";

interface AttendanceSummaryCardViewProps {
  todayStatus: string;
  currentStreak: number;
  thisMonthCount: number;
  isLoading: boolean;
}

export function AttendanceSummaryCardView({
  todayStatus,
  currentStreak,
  thisMonthCount,
  isLoading,
}: AttendanceSummaryCardViewProps) {
  if (isLoading) {
    return <MetricsSkeleton />;
  }

  return (
    <div className="p-4 sm:p-5 rounded-xl border border-border-default bg-background-paper mb-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="w-4 h-4 text-text-secondary" />
        <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
          Attendance Summary
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-2 border-t border-border-default/60 pt-3">
        <div className="p-3 rounded-lg bg-background-default flex flex-col justify-between">
          <div className="flex items-center gap-1 text-[11px] font-medium text-text-muted mb-1">
            <CheckCircle2 className="w-3 h-3 text-text-muted" />
            <span>Today</span>
          </div>
          <div>
            <StatusBadge status={todayStatus} className="text-[10px] px-1.5 py-0" />
          </div>
        </div>

        <div className="p-3 rounded-lg bg-background-default flex flex-col justify-between">
          <div className="flex items-center gap-1 text-[11px] font-medium text-text-muted mb-1">
            <Flame className="w-3 h-3 text-amber-500" />
            <span>Streak</span>
          </div>
          <p className="text-sm sm:text-base font-bold text-text-primary">
            {currentStreak} <span className="text-xs font-medium text-text-secondary">Days</span>
          </p>
        </div>

        <div className="p-3 rounded-lg bg-background-default flex flex-col justify-between">
          <div className="flex items-center gap-1 text-[11px] font-medium text-text-muted mb-1">
            <Calendar className="w-3 h-3 text-text-muted" />
            <span>This Month</span>
          </div>
          <p className="text-sm sm:text-base font-bold text-text-primary">
            {thisMonthCount} <span className="text-xs font-medium text-text-secondary">Days</span>
          </p>
        </div>
      </div>
    </div>
  );
}
