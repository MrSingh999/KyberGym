import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { useWorkout, useUpdateWorkout } from "../hooks/useWorkouts";
import { WorkoutForm } from "../components/WorkoutForm";
import { UpdateWorkoutData, CreateWorkoutData } from "../schemas/workout.schema";
import { Skeleton } from "@/components/feedback/Skeleton";
import { ErrorState } from "@/components/feedback/ErrorState";

export function EditWorkoutPage() {
  const { workoutId } = useParams();
  const navigate = useNavigate();
  const { data: workout, isLoading, isError } = useWorkout(workoutId!);
  const { mutate: updateWorkout, isPending } = useUpdateWorkout(workoutId!);

  const handleSubmit = (data: CreateWorkoutData) => {
    const updateData: UpdateWorkoutData = {
      title: data.title,
      description: data.description,
      assignmentType: data.assignmentType,
      assignedMembers: data.assignedMembers,
    };
    updateWorkout(updateData, {
      onSuccess: () => {
        toast.success("Workout updated");
        navigate(`/admin/workouts/${workoutId}`);
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || "Failed to update workout");
      },
    });
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (isError || !workout) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
        <ErrorState title="Workout not found" message="Could not load this workout for editing." />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-2xl mx-auto space-y-6">
      <button
        onClick={() => navigate(`/admin/workouts/${workoutId}`)}
        className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Workout
      </button>

      <div className="glass-panel p-5 sm:p-6 rounded-[16px] border border-border-hover space-y-4">
        <div className="border-b border-border-default/40 pb-3">
          <h2 className="font-bold text-base text-text-primary font-mono">Edit Workout Split</h2>
          <p className="text-xs text-text-muted mt-1">Update the workout program details.</p>
        </div>
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
  );
}
