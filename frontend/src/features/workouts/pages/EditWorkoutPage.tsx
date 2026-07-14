import { useParams, useNavigate } from "react-router";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { WorkoutForm } from "../components/WorkoutForm";
import { useWorkout, useUpdateWorkout } from "../hooks/useWorkouts";
import { CreateWorkoutData } from "../schemas/workout.schema";
import { Skeleton } from "@/components/feedback/Skeleton";
import { ErrorState } from "@/components/feedback/ErrorState";

export function EditWorkoutPage() {
  const { workoutId } = useParams();
  const navigate = useNavigate();
  const { data: workout, isLoading, isError } = useWorkout(workoutId!);
  const { mutate: updateWorkout, isPending } = useUpdateWorkout(workoutId!);

  const handleSubmit = (data: CreateWorkoutData) => {
    updateWorkout(data, {
      onSuccess: () => {
        toast.success("Workout updated successfully");
        navigate(`/admin/workouts/${workoutId}`);
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || "Failed to update workout");
      },
    });
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
        <Skeleton className="h-6 w-32 mb-6" />
        <Skeleton className="h-8 w-64 mb-8" />
        <div className="rounded-xl border border-default bg-surface p-6 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-48" />
        </div>
      </div>
    );
  }

  if (isError || !workout) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
        <ErrorState
          title="Workout not found"
          message="The workout you're trying to edit doesn't exist or has been removed."
          onRetry={() => navigate("/admin/workouts")}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full bg-canvas">
      <div className="p-4 sm:p-6 lg:p-8 flex-1 w-full max-w-2xl mx-auto">
        <button
          onClick={() => navigate(`/admin/workouts/${workoutId}`)}
          className="flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Workout
        </button>

        <div className="mb-8">
          <h1 className="text-h2 font-heading font-bold text-primary">Edit Workout</h1>
          <p className="text-sm text-muted mt-1">Update workout plan details.</p>
        </div>

        <div className="rounded-xl border border-default bg-surface p-6">
          <WorkoutForm
            defaultValues={{
              title: workout.title,
              description: workout.description,
              assignmentType: workout.assignmentType,
              assignedMembers: workout.assignedMembers,
            }}
            onSubmit={handleSubmit}
            isSubmitting={isPending}
          />
        </div>
      </div>
    </div>
  );
}
