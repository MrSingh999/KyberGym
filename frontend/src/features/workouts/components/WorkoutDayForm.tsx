import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { workoutDaySchema, WorkoutDayFormData } from "../schemas/workout.schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button, LoadingButton } from "@/components/ui/button";
import { ExerciseForm } from "./ExerciseForm";

interface WorkoutDayFormProps {
  defaultValues?: Partial<WorkoutDayFormData>;
  onSubmit: (data: WorkoutDayFormData) => void;
  isSubmitting?: boolean;
  onCancel?: () => void;
}

export function WorkoutDayForm({ defaultValues, onSubmit, isSubmitting, onCancel }: WorkoutDayFormProps) {
  const form = useForm<WorkoutDayFormData>({
    resolver: zodResolver(workoutDaySchema),
    defaultValues: {
      orderIndex: 0,
      dayName: "",
      title: "",
      exercises: [],
      ...defaultValues,
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5 col-span-1">
          <Label className="text-[10px] text-text-muted font-bold uppercase tracking-wider font-mono">
            Order <span className="text-destructive">*</span>
          </Label>
          <Input
            type="number"
            min={0}
            placeholder="0"
            className="mt-1 text-center font-mono"
            {...register("orderIndex", { valueAsNumber: true })}
          />
          {errors.orderIndex && (
            <p className="text-xs text-destructive mt-1">{errors.orderIndex.message}</p>
          )}
        </div>

        <div className="space-y-1.5 col-span-2">
          <Label className="text-[10px] text-text-muted font-bold uppercase tracking-wider font-mono">
            Day Name <span className="text-destructive">*</span>
          </Label>
          <Input
            placeholder="e.g. Push Day"
            className="mt-1"
            {...register("dayName")}
          />
          {errors.dayName && (
            <p className="text-xs text-destructive mt-1">{errors.dayName.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-[10px] text-text-muted font-bold uppercase tracking-wider font-mono">
          Workout Focus / Title
        </Label>
        <Input
          placeholder="e.g. Chest & Triceps"
          className="mt-1"
          {...register("title")}
        />
        {errors.title && (
          <p className="text-xs text-destructive mt-1">{errors.title.message}</p>
        )}
      </div>

      <ExerciseForm form={form} />

      <div className="flex justify-end gap-3 pt-4 border-t border-border-default">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <LoadingButton type="submit" loading={isSubmitting}>
          {defaultValues ? "Update Day" : "Add Day"}
        </LoadingButton>
      </div>
    </form>
  );
}
