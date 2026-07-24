import { CardSkeleton } from "../common/Skeletons";
import { Dumbbell, ChevronRight } from "lucide-react";

interface TodayWorkoutCardViewProps {
  title?: string;
  dayName?: string;
  exerciseCount?: number;
  hasWorkout: boolean;
  isLoading: boolean;
}

export function TodayWorkoutCardView({
  title,
  dayName,
  exerciseCount = 0,
  hasWorkout,
  isLoading,
}: TodayWorkoutCardViewProps) {
  if (isLoading) {
    return <CardSkeleton />;
  }

  if (!hasWorkout) {
    return (
      <div className="p-4 sm:p-5 rounded-xl border border-border-default bg-background-paper mb-4 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Dumbbell className="w-4 h-4 text-text-muted" />
          <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Today's Workout
          </h2>
        </div>
        <p className="text-sm font-semibold text-text-muted mt-2">
          No Workout Assigned Today
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5 rounded-xl border border-border-default bg-background-paper mb-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
          <Dumbbell className="w-3.5 h-3.5 text-brand-500" />
          Today's Workout
        </h2>
        {dayName && (
          <span className="text-xs font-medium text-text-muted bg-background-default px-2 py-0.5 rounded">
            {dayName}
          </span>
        )}
      </div>

      <p className="text-lg sm:text-xl font-bold text-text-primary mt-1">
        {title}
      </p>

      <div className="mt-4 border-t border-border-default/60 pt-3 flex items-center justify-between">
        <span className="text-xs text-text-secondary font-medium">
          {exerciseCount} {exerciseCount === 1 ? "Exercise" : "Exercises"} Scheduled
        </span>

        <button
          type="button"
          className="min-w-[44px] min-h-[44px] px-3 py-1.5 rounded-lg border border-border-default bg-background-default hover:bg-border-default/20 text-xs font-semibold text-text-primary inline-flex items-center gap-1 transition-colors"
        >
          View Workout
          <ChevronRight className="w-3.5 h-3.5 text-text-secondary" />
        </button>
      </div>
    </div>
  );
}
