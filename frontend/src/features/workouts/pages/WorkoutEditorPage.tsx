import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, Save, UserPlus } from "lucide-react";
import { z } from "zod";
import { LoadingButton } from "@/components/ui/button";
import { useWorkout, useCreateWorkout, useSaveNestedWorkout } from "../hooks/useWorkouts";
import { WorkoutInfoSection } from "../components/WorkoutInfoSection";
import { WorkoutDayEditor } from "../components/WorkoutDayEditor";
import { AssignWorkoutModal } from "@/features/workoutAssignments/components/AssignWorkoutModal";
import { Skeleton } from "@/components/feedback/Skeleton";
import { ErrorState } from "@/components/feedback/ErrorState";

const editorSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(100),
  description: z.string().max(500).optional(),
  goal: z.string().max(100).optional(),
  estimatedDuration: z.coerce.number().int().positive().optional(),
  category: z.string().max(50).optional(),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).default("ACTIVE"),
  days: z.array(z.object({
    _id: z.string().optional(),
    dayName: z.string().min(1, "Day name is required").max(50),
    title: z.string().max(100).optional(),
    orderIndex: z.coerce.number().int().min(0),
    exercises: z.array(z.object({
      _id: z.string().optional(),
      name: z.string().min(1, "Exercise name is required").max(100),
      sets: z.coerce.number().int().min(0).optional(),
      reps: z.coerce.number().int().min(0).optional(),
      duration: z.coerce.number().min(0).optional(),
      restTime: z.coerce.number().min(0).optional(),
      notes: z.string().max(300).optional(),
      order: z.coerce.number().int().min(0).optional(),
      exerciseId: z.string().optional().nullable(),
      image: z.string().optional(),
      videoUrl: z.string().optional(),
    })).optional().default([]),
  })).optional().default([]),
});

type EditorFormData = z.infer<typeof editorSchema>;

export function WorkoutEditorPage() {
  const { workoutId } = useParams();
  const navigate = useNavigate();
  const isEdit = !!workoutId;
  const [assignModalOpen, setAssignModalOpen] = useState(false);

  const { data: workout, isLoading, isError } = useWorkout(workoutId ?? "", { enabled: isEdit });
  const { mutate: createWorkout, isPending: isCreating } = useCreateWorkout();
  const { mutate: saveNested, isPending: isSaving } = useSaveNestedWorkout(workoutId ?? "");

  const form = useForm<EditorFormData>({
    resolver: zodResolver(editorSchema),
    defaultValues: {
      title: "",
      description: "",
      goal: "",
      estimatedDuration: undefined,
      category: "",
      status: "ACTIVE",
      days: [],
    },
  });

  useEffect(() => {
    if (workout && isEdit) {
      form.reset({
        title: workout.title,
        description: workout.description || "",
        goal: workout.goal || "",
        estimatedDuration: workout.estimatedDuration,
        category: workout.category || "",
        status: workout.status,
        days: workout.days.map((d) => ({
          _id: d._id,
          dayName: d.dayName,
          title: d.title || "",
          orderIndex: d.orderIndex,
          exercises: d.exercises.map((e) => ({
            _id: e._id,
            name: e.name,
            sets: e.sets,
            reps: e.reps,
            duration: e.duration,
            restTime: e.restTime,
            notes: e.notes || "",
            order: e.order,
            exerciseId: e.exerciseId,
            image: e.image,
            videoUrl: e.videoUrl,
          })),
        })),
      });
    }
  }, [workout, isEdit, form]);

  const handleSubmit = (data: EditorFormData) => {
    if (isEdit && workoutId) {
      saveNested(data, {
        onSuccess: () => {
          toast.success("Workout saved successfully");
          navigate(`/admin/workouts/${workoutId}`);
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || "Failed to save workout");
        },
      });
    } else {
      createWorkout(
        data,
        {
          onSuccess: (res) => {
            const newId = res._id || res.id;
            toast.success("Workout created successfully");
            navigate(`/admin/workouts/${newId}`);
          },
          onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to create workout");
          },
        },
      );
    }
  };

  if (isEdit && isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (isEdit && isError) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        <ErrorState title="Workout not found" message="Could not load this workout for editing." />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-4xl mx-auto space-y-6 pb-24 sm:pb-8">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => navigate(isEdit ? `/admin/workouts/${workoutId}` : "/admin/workouts")}
          className="flex items-center gap-1.5 text-xs font-mono text-text-secondary hover:text-text-primary transition-colors cursor-pointer min-h-[38px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isEdit ? "Back to Workout" : "Back to Workout Library"}</span>
        </button>

        {isEdit && (
          <button
            type="button"
            onClick={() => setAssignModalOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-[6px] text-xs font-mono font-semibold bg-surface border border-border-default hover:bg-surface-hover transition-all cursor-pointer min-h-[38px]"
          >
            <UserPlus className="h-4 w-4 text-primary" />
            <span>Assign to Members</span>
          </button>
        )}
      </div>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <WorkoutInfoSection form={form} />
        <WorkoutDayEditor form={form} />

        {/* Desktop Save Bar */}
        <div className="hidden sm:flex justify-end gap-3 pt-4 border-t border-border-default">
          <button
            type="button"
            onClick={() => navigate(isEdit ? `/admin/workouts/${workoutId}` : "/admin/workouts")}
            className="px-4 py-2.5 rounded-[6px] text-xs font-mono font-semibold bg-surface border border-border-default hover:bg-surface-hover text-text-secondary transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <LoadingButton type="submit" loading={isCreating || isSaving} className="min-h-[40px] px-6 cursor-pointer">
            <Save className="h-4 w-4 mr-2" />
            {isEdit ? "Save Workout Split" : "Create Workout Split"}
          </LoadingButton>
        </div>

        {/* Mobile Sticky Bottom Bar */}
        <div className="sm:hidden fixed bottom-0 left-0 right-0 p-3 bg-surface/95 backdrop-blur-md border-t border-border-default z-40 flex items-center gap-2">
          {isEdit && (
            <button
              type="button"
              onClick={() => setAssignModalOpen(true)}
              className="p-3 rounded-[6px] bg-surface border border-border-default text-text-primary cursor-pointer min-h-[44px] flex items-center justify-center"
              title="Assign"
            >
              <UserPlus className="h-5 w-5 text-primary" />
            </button>
          )}
          <LoadingButton type="submit" loading={isCreating || isSaving} className="flex-1 min-h-[44px] font-mono text-xs cursor-pointer">
            <Save className="h-4 w-4 mr-2" />
            {isEdit ? "Save Workout" : "Create Workout"}
          </LoadingButton>
        </div>
      </form>

      {/* Assign Workout Modal */}
      {isEdit && (
        <AssignWorkoutModal
          open={assignModalOpen}
          onOpenChange={setAssignModalOpen}
          initialWorkoutId={workoutId}
        />
      )}
    </div>
  );
}
