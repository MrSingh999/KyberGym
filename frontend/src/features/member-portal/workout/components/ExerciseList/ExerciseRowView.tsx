import type { ExerciseItem } from "../../types/workout.types";
import { formatRestTime, formatDuration } from "../../../utils/formatters";
import { Clock, Repeat, Layers, FileText, Timer } from "lucide-react";

interface ExerciseRowViewProps {
  exercise: ExerciseItem;
  index: number;
}

export function ExerciseRowView({ exercise, index }: ExerciseRowViewProps) {
  const sets = exercise.sets ?? 0;
  const reps = exercise.reps ?? "0";
  const restTimeFormatted = formatRestTime(exercise.restTime);
  const durationFormatted = formatDuration(exercise.duration);

  return (
    <div className="py-3 px-3 sm:px-4 rounded-lg bg-background-default/60 border border-border-default/50 flex flex-col gap-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className="w-6 h-6 rounded-full bg-border-default/60 text-text-secondary text-xs font-semibold flex items-center justify-center shrink-0"
            aria-hidden="true"
          >
            {index + 1}
          </span>
          <h4 className="text-sm font-semibold text-text-primary truncate">
            {exercise.name}
          </h4>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-text-secondary pl-8 sm:pl-0">
          {sets > 0 && (
            <span className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-text-muted shrink-0" aria-hidden="true" />
              <strong className="text-text-primary font-semibold">{sets}</strong> {sets === 1 ? "Set" : "Sets"}
            </span>
          )}

          {reps !== "0" && reps !== 0 && (
            <span className="flex items-center gap-1">
              <Repeat className="w-3.5 h-3.5 text-text-muted shrink-0" aria-hidden="true" />
              <strong className="text-text-primary font-semibold">{reps}</strong> Reps
            </span>
          )}

          {durationFormatted && (
            <span className="flex items-center gap-1">
              <Timer className="w-3.5 h-3.5 text-text-muted shrink-0" aria-hidden="true" />
              <strong className="text-text-primary font-semibold">{durationFormatted}</strong>
            </span>
          )}

          {restTimeFormatted && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-text-muted shrink-0" aria-hidden="true" />
              <span>Rest: <strong className="text-text-primary font-semibold">{restTimeFormatted}</strong></span>
            </span>
          )}
        </div>
      </div>

      {exercise.notes && (
        <div className="pl-8 sm:pl-8 text-xs text-text-muted flex items-start gap-1.5 border-t border-border-default/40 pt-2 mt-1">
          <FileText className="w-3.5 h-3.5 text-text-muted shrink-0 mt-0.5" aria-hidden="true" />
          <p className="line-clamp-2 leading-relaxed">{exercise.notes}</p>
        </div>
      )}
    </div>
  );
}
