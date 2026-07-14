import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createWorkoutSchema, CreateWorkoutData } from "../schemas/workout.schema";
import { Button, LoadingButton } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface WorkoutFormProps {
  defaultValues?: Partial<CreateWorkoutData>;
  onSubmit: (data: CreateWorkoutData) => void;
  isSubmitting?: boolean;
}

export function WorkoutForm({ defaultValues, onSubmit, isSubmitting }: WorkoutFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateWorkoutData>({
    resolver: zodResolver(createWorkoutSchema),
    defaultValues: {
      title: "",
      description: "",
      assignmentType: "ALL",
      assignedMembers: [],
      ...defaultValues,
    },
  });

  const assignmentType = watch("assignmentType");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Title */}
      <div>
        <Label htmlFor="title" className="text-sm font-medium text-primary">
          Workout Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          placeholder="e.g. Beginner Full Body"
          className="mt-1.5"
          {...register("title")}
        />
        {errors.title && (
          <p className="text-xs text-destructive mt-1">{errors.title.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description" className="text-sm font-medium text-primary">
          Description
        </Label>
        <Textarea
          id="description"
          placeholder="Brief description of this workout..."
          className="mt-1.5 resize-none"
          rows={3}
          {...register("description")}
        />
        {errors.description && (
          <p className="text-xs text-destructive mt-1">{errors.description.message}</p>
        )}
      </div>

      {/* Assignment Type */}
      <div>
        <Label className="text-sm font-medium text-primary">
          Assignment Type <span className="text-destructive">*</span>
        </Label>
        <RadioGroup
          value={assignmentType}
          onValueChange={(v) => setValue("assignmentType", v as "ALL" | "SELECTED")}
          className="flex gap-4 mt-2"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="ALL" id="all" />
            <Label htmlFor="all" className="text-sm text-primary cursor-pointer">All Members</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="SELECTED" id="selected" />
            <Label htmlFor="selected" className="text-sm text-primary cursor-pointer">Selected Members</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Assigned Members - only shown when SELECTED */}
      {assignmentType === "SELECTED" && (
        <div>
          <Label className="text-sm font-medium text-primary">
            Assigned Members (IDs)
          </Label>
          <p className="text-xs text-muted mt-1">
            Member selection will be available after creation.
          </p>
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-end gap-3 pt-4 border-t border-default">
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Cancel
        </Button>
        <LoadingButton type="submit" loading={isSubmitting}>
          {defaultValues ? "Update Workout" : "Create Workout"}
        </LoadingButton>
      </div>
    </form>
  );
}
