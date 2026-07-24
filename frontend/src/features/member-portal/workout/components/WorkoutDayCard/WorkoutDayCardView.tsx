import { ReactNode } from "react";
import { CardSkeleton } from "../../../components/common/Skeletons";
import { StatusBadge } from "../../../components/common/StatusBadge";
import { CalendarDays } from "lucide-react";

interface WorkoutDayCardViewProps {
  dayName?: string;
  workoutTitle?: string;
  isRestDay?: boolean;
  actions?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  isLoading: boolean;
}

export function WorkoutDayCardView({
  dayName = "Scheduled Day",
  workoutTitle = "Active Program",
  isRestDay = false,
  actions,
  footer,
  children,
  isLoading,
}: WorkoutDayCardViewProps) {
  if (isLoading) {
    return <CardSkeleton />;
  }

  return (
    <div className="p-4 sm:p-5 rounded-xl border border-border-default bg-background-paper mb-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
          <CalendarDays className="w-3.5 h-3.5 text-text-secondary" aria-hidden="true" />
          Scheduled Workout Day
        </h2>
        <div className="flex items-center gap-2">
          <StatusBadge status={isRestDay ? "disabled" : "active"} />
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      </div>

      <p className="text-lg sm:text-xl font-bold text-text-primary truncate">
        {dayName}
      </p>

      <p className="text-xs font-medium text-text-secondary mt-1 truncate">
        Program: <span className="font-semibold text-text-primary">{workoutTitle}</span>
      </p>

      {children && <div className="mt-3">{children}</div>}
      {footer && <div className="mt-3 pt-3 border-t border-border-default/60">{footer}</div>}
    </div>
  );
}
