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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Title */}
      <div className="space-y-1.5">
        <Label className="text-[10px] text-text-muted font-bold uppercase tracking-wider font-mono">
          Program Title <span className="text-destructive">*</span>
        </Label>
        <Input
          placeholder="e.g. 6 Days Beginner Program"
          className="mt-1"
          {...register("title")}
        />
        {errors.title && (
          <p className="text-xs text-destructive mt-1">{errors.title.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label className="text-[10px] text-text-muted font-bold uppercase tracking-wider font-mono">
          Description
        </Label>
        <Textarea
          placeholder="Brief description of the routines focus (hypertrophy, endurance, etc.)"
          className="mt-1 resize-none"
          rows={3}
          {...register("description")}
        />
        {errors.description && (
          <p className="text-xs text-destructive mt-1">{errors.description.message}</p>
        )}
      </div>

      {/* Assignment Type */}
      <div className="space-y-1.5">
        <Label className="text-[10px] text-text-muted font-bold uppercase tracking-wider font-mono">
          Assignment Type <span className="text-destructive">*</span>
        </Label>
        <div className="grid grid-cols-2 gap-4 mt-1">
          <div
            className={`border rounded-[6px] p-3 cursor-pointer transition-all ${
              assignmentType === "ALL"
                ? "border-primary bg-primary/5"
                : "border-border-default hover:border-border-hover"
            }`}
            onClick={() => setValue("assignmentType", "ALL")}
          >
            <RadioGroupItem value="ALL" id="all" className="sr-only" />
            <Label htmlFor="all" className="text-xs font-semibold text-text-primary cursor-pointer font-mono">
              All Members
            </Label>
            <p className="text-[10px] text-text-muted mt-0.5">Assign to all active members</p>
          </div>
          <div
            className={`border rounded-[6px] p-3 cursor-pointer transition-all ${
              assignmentType === "SELECTED"
                ? "border-primary bg-primary/5"
                : "border-border-default hover:border-border-hover"
            }`}
            onClick={() => setValue("assignmentType", "SELECTED")}
          >
            <RadioGroupItem value="SELECTED" id="selected" className="sr-only" />
            <Label htmlFor="selected" className="text-xs font-semibold text-text-primary cursor-pointer font-mono">
              Selected Members
            </Label>
            <p className="text-[10px] text-text-muted mt-0.5">Choose specific members</p>
          </div>
        </div>
      </div>

      {/* Assigned Members - only shown when SELECTED */}
      {assignmentType === "SELECTED" && (
        <div className="space-y-1.5">
          <Label className="text-[10px] text-text-muted font-bold uppercase tracking-wider font-mono">
            Assigned Members
          </Label>
          <p className="text-xs text-text-muted mt-1">
            Member selection will be available after creation.
          </p>
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-end gap-3 pt-4 border-t border-border-default">
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
