import { ReactNode } from "react";
import { CardSkeleton } from "../../../components/common/Skeletons";
import { UserCheck, Calendar } from "lucide-react";
import type { WorkoutMetadataItem } from "../../types/workout.types";

interface WorkoutHeaderViewProps {
  workoutName?: string;
  trainerName?: string;
  dayCount?: number;
  metadataItems?: WorkoutMetadataItem[];
  actions?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  isLoading: boolean;
}

export function WorkoutHeaderView({
  workoutName = "Assigned Workout Plan",
  trainerName,
  dayCount = 0,
  metadataItems = [],
  actions,
  footer,
  children,
  isLoading,
}: WorkoutHeaderViewProps) {
  if (isLoading) {
    return <CardSkeleton />;
  }

  return (
    <header className="mb-6">
      <div className="flex items-center justify-between gap-2 mb-1">
        <p className="text-xs sm:text-sm font-semibold text-text-secondary uppercase tracking-wider">
          My Workout Program
        </p>

        {dayCount > 0 && (
          <span className="inline-flex items-center gap-1 text-xs text-text-muted bg-background-paper border border-border-default/60 px-2.5 py-0.5 rounded-full shrink-0">
            <Calendar className="w-3 h-3" aria-hidden="true" />
            <span>{dayCount} {dayCount === 1 ? "Day" : "Days"}</span>
          </span>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight truncate">
          {workoutName}
        </h1>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>

      {trainerName && (
        <p className="text-xs sm:text-sm text-text-secondary mt-1.5 flex items-center gap-1.5 font-medium">
          <UserCheck className="w-3.5 h-3.5 text-brand-500 shrink-0" aria-hidden="true" />
          <span className="truncate">
            Assigned by Trainer: <strong className="text-text-primary">{trainerName}</strong>
          </span>
        </p>
      )}

      {metadataItems.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-border-default/40">
          {metadataItems.map((item, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 text-xs font-medium text-text-secondary bg-background-paper border border-border-default/60 px-2.5 py-1 rounded-lg"
            >
              <span className="text-text-muted">{item.label}:</span>
              <strong className="text-text-primary font-semibold">{item.value}</strong>
            </span>
          ))}
        </div>
      )}

      {children && <div className="mt-3">{children}</div>}
      {footer && <div className="mt-3 pt-3 border-t border-border-default/60">{footer}</div>}
    </header>
  );
}
