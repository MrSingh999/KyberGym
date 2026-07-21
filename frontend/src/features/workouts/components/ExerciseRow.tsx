import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Timer, Dumbbell, Repeat, Video, Image as ImageIcon } from "lucide-react";

interface ExerciseRowProps {
  form: UseFormReturn<any>;
  dayIndex: number;
  exerciseIndex: number;
  onRemove: () => void;
}

export function ExerciseRow({ form, dayIndex, exerciseIndex, onRemove }: ExerciseRowProps) {
  const exercisePath = `days.${dayIndex}.exercises.${exerciseIndex}`;
  const errors = form.formState.errors?.days?.[dayIndex]?.exercises?.[exerciseIndex];

  return (
    <div className="bg-surface border border-border-default hover:border-border-hover p-3.5 rounded-[12px] space-y-3 relative group transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 grid grid-cols-12 gap-3">
          <div className="col-span-12 sm:col-span-4 space-y-1">
            <Label className="text-[10px] text-text-muted font-bold uppercase tracking-wider font-mono flex items-center gap-1">
              <Dumbbell className="h-3 w-3 text-primary" />
              Exercise Name <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="e.g. Barbell Bench Press"
              {...form.register(`${exercisePath}.name`)}
              className={errors?.name ? "border-destructive font-mono text-xs" : "font-mono text-xs"}
            />
          </div>

          <div className="col-span-4 sm:col-span-2 space-y-1">
            <Label className="text-[10px] text-text-muted font-bold uppercase tracking-wider font-mono flex items-center gap-1">
              <span className="text-indigo-400">#</span> Sets
            </Label>
            <Input
              type="number"
              placeholder="4"
              {...form.register(`${exercisePath}.sets`, { valueAsNumber: true })}
              className="font-mono text-xs tabular-nums"
            />
          </div>

          <div className="col-span-4 sm:col-span-2 space-y-1">
            <Label className="text-[10px] text-text-muted font-bold uppercase tracking-wider font-mono flex items-center gap-1">
              <Repeat className="h-3 w-3 text-emerald-400" /> Reps
            </Label>
            <Input
              type="number"
              placeholder="10"
              {...form.register(`${exercisePath}.reps`, { valueAsNumber: true })}
              className="font-mono text-xs tabular-nums"
            />
          </div>

          <div className="col-span-4 sm:col-span-2 space-y-1">
            <Label className="text-[10px] text-text-muted font-bold uppercase tracking-wider font-mono flex items-center gap-1">
              <Timer className="h-3 w-3 text-amber-400" /> Rest (s)
            </Label>
            <Input
              type="number"
              placeholder="60"
              {...form.register(`${exercisePath}.restTime`, { valueAsNumber: true })}
              className="font-mono text-xs tabular-nums"
            />
          </div>

          <div className="col-span-12 sm:col-span-2 space-y-1">
            <Label className="text-[10px] text-text-muted font-bold uppercase tracking-wider font-mono">Order</Label>
            <Input
              type="number"
              placeholder="0"
              {...form.register(`${exercisePath}.order`, { valueAsNumber: true })}
              className="font-mono text-xs tabular-nums"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={onRemove}
          className="p-2 text-text-muted hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors cursor-pointer shrink-0 mt-5 min-h-[36px] min-w-[36px] flex items-center justify-center"
          title="Delete exercise"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Media URLs (YouTube Video & Exercise Image) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border-default/30">
        <div className="space-y-1">
          <Label className="text-[10px] text-text-muted font-bold uppercase tracking-wider font-mono flex items-center gap-1">
            <Video className="h-3 w-3 text-red-500 shrink-0" />
            YouTube Video Link (Optional)
          </Label>
          <Input
            placeholder="https://youtube.com/watch?v=..."
            {...form.register(`${exercisePath}.videoUrl`)}
            className="font-mono text-xs"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-[10px] text-text-muted font-bold uppercase tracking-wider font-mono flex items-center gap-1">
            <ImageIcon className="h-3 w-3 text-blue-400 shrink-0" />
            Exercise Image / GIF URL (Optional)
          </Label>
          <Input
            placeholder="https://example.com/exercise.gif"
            {...form.register(`${exercisePath}.image`)}
            className="font-mono text-xs"
          />
        </div>
      </div>

      <div className="space-y-1 pt-1">
        <Label className="text-[10px] text-text-muted font-bold uppercase tracking-wider font-mono">Instructions / Form Notes</Label>
        <Input
          placeholder="e.g. Keep elbows at 45 degrees, slow tempo"
          {...form.register(`${exercisePath}.notes`)}
          className="font-mono text-xs"
        />
      </div>

      {errors?.name && (
        <p className="text-xs text-destructive font-mono">{errors.name.message as string}</p>
      )}
    </div>
  );
}
