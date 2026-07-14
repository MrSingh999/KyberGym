import { useNavigate } from "react-router";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { useCreateWorkout } from "../hooks/useWorkouts";
import { WorkoutForm } from "../components/WorkoutForm";
import { CreateWorkoutData } from "../schemas/workout.schema";

export function CreateWorkoutPage() {
  const navigate = useNavigate();
  const { mutate: createWorkout, isPending } = useCreateWorkout();

  const handleSubmit = (data: CreateWorkoutData) => {
    createWorkout(data, {
      onSuccess: (res) => {
        toast.success("Workout created");
        navigate(`/admin/workouts/${res.id || res._id}`);
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || "Failed to create workout");
      },
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-2xl mx-auto space-y-6">
      <button
        onClick={() => navigate("/admin/workouts")}
        className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Workouts
      </button>

      <div className="glass-panel p-5 sm:p-6 rounded-[16px] border border-border-hover space-y-4">
        <div className="border-b border-border-default/40 pb-3">
          <h2 className="font-bold text-base text-text-primary font-mono">New Workout Split</h2>
          <p className="text-xs text-text-muted mt-1">Create a new fitness split routine program.</p>
        </div>
        <WorkoutForm onSubmit={handleSubmit} isSubmitting={isPending} />
      </div>
    </div>
  );
}
