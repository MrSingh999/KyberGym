import { useMemberWorkoutContext } from "../context/useMemberWorkoutContext";
import { WorkoutHeaderView } from "../components/WorkoutHeader/WorkoutHeaderView";
import { WorkoutSummaryCardView } from "../components/WorkoutSummaryCard/WorkoutSummaryCardView";
import { WorkoutDayCardView } from "../components/WorkoutDayCard/WorkoutDayCardView";
import { ExerciseListView } from "../components/ExerciseList/ExerciseListView";
import { EmptyWorkoutView } from "../components/EmptyWorkout/EmptyWorkoutView";
import { formatDuration } from "../../utils/formatters";
import type { WorkoutMetadataItem } from "../types/workout.types";
import { AlertCircle, RefreshCw } from "lucide-react";

export function WorkoutPageContainer() {
  const { workouts, isLoading, error, refetch } = useMemberWorkoutContext();

  if (error) {
    return (
      <div className="p-6 sm:p-8 rounded-xl border border-border-default bg-background-paper text-center max-w-md mx-auto my-8 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-3">
          <AlertCircle className="w-6 h-6" aria-hidden="true" />
        </div>
        <h2 className="text-base sm:text-lg font-bold text-text-primary mb-1">
          Unable to load your workout.
        </h2>
        <p className="text-xs text-text-secondary mb-5">
          Please check your network connection and try again.
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="min-w-[44px] min-h-[44px] px-5 py-2.5 text-xs font-semibold rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition-colors inline-flex items-center justify-center gap-2 shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Try Again</span>
        </button>
      </div>
    );
  }

  const hasWorkout = Boolean(workouts && workouts.length > 0);

  if (!isLoading && !hasWorkout) {
    return <EmptyWorkoutView />;
  }

  const activeWorkout = workouts?.[0];
  const trainerName = typeof activeWorkout?.assignedTrainer === "object"
    ? activeWorkout.assignedTrainer?.fullName || activeWorkout.assignedTrainer?.name
    : activeWorkout?.assignedTrainer;

  const dayCount = activeWorkout?.days?.length || 0;

  // Build clean metadata array
  const metadataItems: WorkoutMetadataItem[] = [];

  if (activeWorkout?.goal) {
    metadataItems.push({ label: "Goal", value: activeWorkout.goal });
  }
  if (activeWorkout?.category) {
    metadataItems.push({ label: "Category", value: activeWorkout.category });
  }
  if (activeWorkout?.estimatedDuration) {
    const formattedEst = formatDuration(activeWorkout.estimatedDuration);
    if (formattedEst) {
      metadataItems.push({ label: "Est. Duration", value: formattedEst });
    }
  }

  // Resolve active day
  const today = new Date();
  const dayIndex = today.getDay();
  const days = activeWorkout?.days || [];
  const activeDay = days.length > 0 ? (days[dayIndex % days.length] || days[0]) : null;

  const exercises = activeDay?.exercises || [];
  const isRestDay = Boolean(!activeDay || exercises.length === 0);
  const formattedDuration = formatDuration(activeWorkout?.estimatedDuration);

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-1">
      <WorkoutHeaderView
        workoutName={activeWorkout?.name}
        trainerName={trainerName}
        dayCount={dayCount}
        metadataItems={metadataItems}
        isLoading={isLoading}
      />

      <WorkoutSummaryCardView
        scheduledTitle={activeDay?.title || activeDay?.dayName}
        exerciseCount={exercises.length}
        formattedDuration={formattedDuration}
        hasWorkout={hasWorkout}
        isLoading={isLoading}
      />

      <WorkoutDayCardView
        dayName={activeDay?.title || activeDay?.dayName || "Scheduled Workout"}
        workoutTitle={activeWorkout?.name}
        isRestDay={isRestDay}
        isLoading={isLoading}
      />

      <ExerciseListView
        exercises={exercises}
        isLoading={isLoading}
      />
    </div>
  );
}
