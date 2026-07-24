import { ReactNode } from "react";
import { CardSkeleton } from "../../../components/common/Skeletons";
import { Dumbbell, Clock, Activity } from "lucide-react";

interface WorkoutSummaryCardViewProps {
  scheduledTitle?: string;
  exerciseCount?: number;
  formattedDuration?: string;
  hasWorkout: boolean;
  actions?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  isLoading: boolean;
}

export function WorkoutSummaryCardView({
  scheduledTitle,
  exerciseCount = 0,
  formattedDuration,
  hasWorkout,
  actions,
  footer,
  children,
  isLoading,
}: WorkoutSummaryCardViewProps) {
  if (isLoading) {
    return <CardSkeleton />;
  }

  if (!hasWorkout) {
    return (
      <div className="p-4 sm:p-5 rounded-xl border border-border-default bg-background-paper mb-4 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Dumbbell className="w-4 h-4 text-text-muted" aria-hidden="true" />
          <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Today's Workout Summary
          </h2>
        </div>
        <p className="text-sm font-semibold text-text-muted mt-2">
          No workout assigned.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5 rounded-xl border border-border-default bg-background-paper mb-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-brand-500" aria-hidden="true" />
          Today's Scheduled Routine
        </h2>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>

      <p className="text-lg sm:text-xl font-bold text-text-primary truncate">
        {scheduledTitle || "Scheduled Workout"}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-text-secondary border-t border-border-default/60 pt-3">
        <div className="flex items-center gap-2">
          <Dumbbell className="w-4 h-4 text-text-muted shrink-0" aria-hidden="true" />
          <div>
            <span className="block text-[11px] text-text-muted">Exercises</span>
            <span className="font-semibold text-text-primary">{exerciseCount}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-text-muted shrink-0" aria-hidden="true" />
          <div>
            <span className="block text-[11px] text-text-muted">Est. Duration</span>
            <span className="font-semibold text-text-primary">
              {formattedDuration || "N/A"}
            </span>
          </div>
        </div>
      </div>

      {children && <div className="mt-3">{children}</div>}
      {footer && <div className="mt-3 pt-3 border-t border-border-default/60">{footer}</div>}
    </div>
  );
}
