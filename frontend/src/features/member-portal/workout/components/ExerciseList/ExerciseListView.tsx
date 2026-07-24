import type { ExerciseItem } from "../../types/workout.types";
import { ExerciseRowView } from "./ExerciseRowView";
import { Dumbbell } from "lucide-react";

interface ExerciseListViewProps {
  exercises: ExerciseItem[];
  isLoading: boolean;
}

export function ExerciseListView({ exercises, isLoading }: ExerciseListViewProps) {
  if (isLoading) {
    return (
      <div className="p-4 sm:p-5 rounded-xl border border-border-default bg-background-paper mb-4 shadow-sm">
        <div className="h-4 bg-border-default/60 rounded w-1/3 mb-3 animate-pulse" />
        <div className="space-y-2">
          <div className="h-10 bg-border-default/40 rounded-lg animate-pulse" />
          <div className="h-10 bg-border-default/40 rounded-lg animate-pulse" />
          <div className="h-10 bg-border-default/40 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5 rounded-xl border border-border-default bg-background-paper mb-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Dumbbell className="w-4 h-4 text-brand-500" aria-hidden="true" />
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
          Exercise Routine ({exercises.length})
        </h3>
      </div>

      {exercises.length === 0 ? (
        <div className="border-t border-border-default/60 pt-3">
          <p className="text-sm font-medium text-text-muted">
            No exercises available.
          </p>
        </div>
      ) : (
        <div className="space-y-2 border-t border-border-default/60 pt-3">
          {exercises.map((exercise, index) => (
            <ExerciseRowView key={exercise._id || index} exercise={exercise} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
