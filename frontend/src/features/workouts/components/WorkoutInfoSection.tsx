import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const GOAL_SUGGESTIONS = [
  "Weight Loss", "Muscle Gain", "Strength", "General Fitness",
  "Women Fitness", "Senior Citizen", "Rehabilitation", "CrossFit", "Powerlifting",
];

const CATEGORY_SUGGESTIONS = [
  "Upper Body", "Lower Body", "Push Pull Legs", "Cardio", "HIIT", "Strength", "Full Body",
];

interface WorkoutInfoSectionProps {
  form: UseFormReturn<any>;
}

export function WorkoutInfoSection({ form }: WorkoutInfoSectionProps) {
  const { register, watch, setValue, formState: { errors } } = form;
  const status = watch("status");

  return (
    <div className="glass-panel p-5 sm:p-6 rounded-[16px] border border-border-hover space-y-5">
      <h3 className="font-bold text-sm text-text-primary font-mono uppercase tracking-wider">Workout Information</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-[10px] text-text-muted font-bold uppercase tracking-wider font-mono">
            Title <span className="text-destructive">*</span>
          </Label>
          <Input
            placeholder="e.g. 4 Day Upper/Lower Split"
            {...register("title")}
            className={errors.title ? "border-destructive" : ""}
          />
          {errors.title && <p className="text-xs text-destructive">{errors.title.message as string}</p>}
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-[10px] text-text-muted font-bold uppercase tracking-wider font-mono">Description</Label>
          <Textarea
            placeholder="Brief description of the program"
            rows={2}
            {...register("description")}
          />
        </div>

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
            onValueChange={(v) => setValue("status", v)}
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
    </div>
  );
}
