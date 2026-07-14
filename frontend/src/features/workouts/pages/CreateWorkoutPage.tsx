import { useNavigate } from "react-router";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { WorkoutForm } from "../components/WorkoutForm";
import { useCreateWorkout } from "../hooks/useWorkouts";
import { CreateWorkoutData } from "../schemas/workout.schema";

export function CreateWorkoutPage() {
  const navigate = useNavigate();
  const { mutate: createWorkout, isPending } = useCreateWorkout();

  const handleSubmit = (data: CreateWorkoutData) => {
    createWorkout(data, {
      onSuccess: (result) => {
        toast.success("Workout created successfully");
        navigate(`/admin/workouts/${result._id || result.id}`);
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || "Failed to create workout");
      },
    });
  };

  return (
    <div className="flex flex-col min-h-full bg-canvas">
      <div className="p-4 sm:p-6 lg:p-8 flex-1 w-full max-w-2xl mx-auto">
        {/* Back navigation */}
        <button
          onClick={() => navigate("/admin/workouts")}
          className="flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Workouts
        </button>

        {/* Page heading */}
        <div className="mb-8">
          <h1 className="text-h2 font-heading font-bold text-primary">Create Workout</h1>
          <p className="text-sm text-muted mt-1">Design a new workout plan for your members.</p>
        </div>

        {/* Form */}
        <div className="rounded-xl border border-default bg-surface p-6">
          <WorkoutForm onSubmit={handleSubmit} isSubmitting={isPending} />
        </div>
      </div>
    </div>
  );
}
