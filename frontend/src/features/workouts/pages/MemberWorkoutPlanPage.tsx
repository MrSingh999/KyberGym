import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useGymStore } from "@/store/gym.store";
import { apiClient } from "@/lib/apiClient";
import { WorkoutWithDays } from "../types";
import { WorkoutDayCard } from "../components/WorkoutDayCard";
import { Skeleton } from "@/components/feedback/Skeleton";
import { ErrorState } from "@/components/feedback/ErrorState";
import { Dumbbell, ChevronDown, ChevronUp } from "lucide-react";

export function MemberWorkoutPlanPage() {
  const { selectedGymId } = useGymStore();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const { data: workouts, isLoading, isError } = useQuery({
    queryKey: ["my-workouts", selectedGymId],
    queryFn: async () => {
      const response = await apiClient.get("/members/me/workouts");
      const raw = response.data.data || response.data;
      return (Array.isArray(raw) ? raw : []).map((w: any): WorkoutWithDays => ({
        id: w._id,
        gymId: w.gymId,
        title: w.title,
        description: w.description,
        assignmentType: w.assignmentType,
        assignedMembers: w.assignedMembers || [],
        isActive: w.isActive ?? true,
        createdBy: w.createdBy,
        createdAt: w.createdAt,
        updatedAt: w.updatedAt,
        days: (w.days || []).map((d: any) => ({
          id: d._id,
          workoutId: d.workoutId || w._id,
          dayNumber: d.dayNumber,
          dayName: d.dayName,
          title: d.title,
          exercises: (d.exercises || []).map((e: any) => ({
            name: e.name,
            sets: e.sets,
            reps: e.reps,
            duration: e.duration,
            notes: e.notes,
            image: e.image,
            videoUrl: e.videoUrl,
          })),
          createdAt: d.createdAt,
          updatedAt: d.updatedAt,
        })),
      }));
    },
    enabled: !!selectedGymId,
    staleTime: 5 * 60 * 1000,
  });

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 sm:p-6">
        <ErrorState title="Could not load workouts" message="Failed to fetch your workout plan." />
      </div>
    );
  }

  if (!workouts || workouts.length === 0) {
    return (
      <div className="p-4 sm:p-6">
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-surface-hover border border-default flex items-center justify-center mx-auto mb-4">
            <Dumbbell className="w-7 h-7 text-muted" />
          </div>
          <h2 className="font-heading font-semibold text-lg text-primary mb-2">No Workouts Assigned</h2>
          <p className="text-sm text-muted max-w-xs mx-auto">
            You don't have any workout plans yet. Contact your gym staff to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 flex-1 w-full max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-h2 font-heading font-bold text-primary">My Workout Plan</h1>
        <p className="text-sm text-muted mt-1">View your assigned workouts and exercises.</p>
      </div>

      <div className="space-y-4">
        {workouts.map((workout) => (
          <div key={workout.id} className="rounded-xl border border-default bg-surface overflow-hidden">
            <button
              onClick={() => toggleExpanded(workout.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-surface-hover transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Dumbbell className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-primary">{workout.title}</h3>
                  {workout.description && (
                    <p className="text-xs text-muted mt-0.5">{workout.description}</p>
                  )}
                  <p className="text-xs text-muted mt-1">
                    {workout.days.length} day{workout.days.length !== 1 ? "s" : ""}
                    {" • "}
                    {workout.days.reduce((s, d) => s + d.exercises.length, 0)} exercise
                    {workout.days.reduce((s, d) => s + d.exercises.length, 0) !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              {expandedIds.has(workout.id) ? (
                <ChevronUp className="w-5 h-5 text-muted" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted" />
              )}
            </button>

            {expandedIds.has(workout.id) && (
              <div className="border-t border-default p-4 space-y-3">
                {workout.days.length === 0 ? (
                  <p className="text-sm text-muted text-center py-4">No days added to this workout yet.</p>
                ) : (
                  workout.days
                    .sort((a, b) => a.dayNumber - b.dayNumber)
                    .map((day, i) => (
                      <WorkoutDayCard key={day.id || i} day={day} index={i} />
                    ))
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
