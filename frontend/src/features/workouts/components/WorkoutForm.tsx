import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createWorkoutSchema, CreateWorkoutData } from "../schemas/workout.schema";
import { Button, LoadingButton } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface WorkoutFormProps {
  defaultValues?: Partial<CreateWorkoutData>;
  onSubmit: (data: CreateWorkoutData) => void;
  isSubmitting?: boolean;
}

const GOAL_SUGGESTIONS = [
  "Weight Loss", "Muscle Gain", "Strength", "General Fitness",
  "Women Fitness", "Senior Citizen", "Rehabilitation", "CrossFit", "Powerlifting",
];

const CATEGORY_SUGGESTIONS = [
  "Upper Body", "Lower Body", "Push Pull Legs", "Cardio", "HIIT", "Strength", "Full Body",
];

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
      goal: "",
      category: "",
      status: "ACTIVE",
      ...defaultValues,
    },
  });

  const status = watch("status");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-1.5">
        <Label className="text-[10px] text-text-muted font-bold uppercase tracking-wider font-mono">
          Program Title <span className="text-destructive">*</span>
        </Label>
        <Input
          placeholder="e.g. 4 Day Upper/Lower Split"
          className="mt-1"
          {...register("title")}
        />
        {errors.title && (
          <p className="text-xs text-destructive mt-1">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label className="text-[10px] text-text-muted font-bold uppercase tracking-wider font-mono">
          Description
        </Label>
        <Textarea
          placeholder="Brief description of the program"
          className="mt-1 resize-none"
          rows={3}
          {...register("description")}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-[10px] text-text-muted font-bold uppercase tracking-wider font-mono">Goal</Label>
          <input
            list="goal-suggestions"
            className="w-full bg-surface border border-border-default rounded-[6px] px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-border-hover font-mono"
            placeholder="e.g. Weight Loss"
            {...register("goal")}
          />
          <datalist id="goal-suggestions">
            {GOAL_SUGGESTIONS.map(g => <option key={g} value={g} />)}
          </datalist>
        </div>

        <div className="space-y-1.5">
          <Label className="text-[10px] text-text-muted font-bold uppercase tracking-wider font-mono">Category</Label>
          <input
            list="category-suggestions"
            className="w-full bg-surface border border-border-default rounded-[6px] px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-border-hover font-mono"
            placeholder="e.g. Upper Body"
            {...register("category")}
          />
          <datalist id="category-suggestions">
            {CATEGORY_SUGGESTIONS.map(c => <option key={c} value={c} />)}
          </datalist>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-[10px] text-text-muted font-bold uppercase tracking-wider font-mono">
            Est. Duration (min)
          </Label>
          <Input
            type="number"
            placeholder="45"
            {...register("estimatedDuration", { valueAsNumber: true })}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-[10px] text-text-muted font-bold uppercase tracking-wider font-mono">Status</Label>
          <Select
            value={status || "ACTIVE"}
            onValueChange={(v) => setValue("status", v as any)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

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
