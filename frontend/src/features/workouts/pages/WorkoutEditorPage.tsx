import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { z } from "zod";
import { LoadingButton } from "@/components/ui/button";
import { useWorkout, useCreateWorkout, useSaveNestedWorkout } from "../hooks/useWorkouts";
import { WorkoutInfoSection } from "../components/WorkoutInfoSection";
import { WorkoutDayEditor } from "../components/WorkoutDayEditor";
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
          toast.success("Workout saved");
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
            toast.success("Workout created");
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
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => navigate(isEdit ? `/admin/workouts/${workoutId}` : "/admin/workouts")}
        className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {isEdit ? "Back to Workout" : "Back to Workouts"}
      </button>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <WorkoutInfoSection form={form} />
        <WorkoutDayEditor form={form} />

        <div className="flex justify-end gap-3 pt-2">
          <LoadingButton type="submit" loading={isCreating || isSaving}>
            {isEdit ? "Save Workout" : "Create Workout"}
          </LoadingButton>
        </div>
      </form>
    </div>
  );
}
