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
      dayNumber: 1,
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
      {/* Day Number */}
      <div>
        <Label htmlFor="dayNumber" className="text-sm font-medium text-primary">
          Day Number <span className="text-destructive">*</span>
        </Label>
        <Input
          id="dayNumber"
          type="number"
          min={1}
          max={7}
          placeholder="1-7"
          className="mt-1.5 w-24"
          {...register("dayNumber", { valueAsNumber: true })}
        />
        {errors.dayNumber && (
          <p className="text-xs text-destructive mt-1">{errors.dayNumber.message}</p>
        )}
      </div>

      {/* Day Name */}
      <div>
        <Label htmlFor="dayName" className="text-sm font-medium text-primary">
          Day Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="dayName"
          placeholder="e.g. Push Day, Upper Body, Cardio"
          className="mt-1.5"
          {...register("dayName")}
        />
        {errors.dayName && (
          <p className="text-xs text-destructive mt-1">{errors.dayName.message}</p>
        )}
      </div>

      {/* Title (optional) */}
      <div>
        <Label htmlFor="title" className="text-sm font-medium text-primary">
          Title (optional)
        </Label>
        <Input
          id="title"
          placeholder="e.g. Week 1 - Monday"
          className="mt-1.5"
          {...register("title")}
        />
        {errors.title && (
          <p className="text-xs text-destructive mt-1">{errors.title.message}</p>
        )}
      </div>

      {/* Exercises */}
      <ExerciseForm form={form} />

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-default">
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
