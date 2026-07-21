import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";

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
    <div className="bg-surface/45 border border-border-default p-3 rounded-[6px] space-y-2 relative group">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 grid grid-cols-12 gap-2">
          <div className="col-span-12 sm:col-span-4">
            <Label className="text-[10px] text-text-muted font-bold uppercase tracking-wider font-mono">Name</Label>
            <Input
              placeholder="Exercise name"
              {...form.register(`${exercisePath}.name`)}
              className={errors?.name ? "border-destructive" : ""}
            />
          </div>
          <div className="col-span-4 sm:col-span-2">
            <Label className="text-[10px] text-text-muted font-bold uppercase tracking-wider font-mono">Sets</Label>
            <Input
              type="number"
              placeholder="4"
              {...form.register(`${exercisePath}.sets`, { valueAsNumber: true })}
            />
          </div>
          <div className="col-span-4 sm:col-span-2">
            <Label className="text-[10px] text-text-muted font-bold uppercase tracking-wider font-mono">Reps</Label>
            <Input
              type="number"
              placeholder="10"
              {...form.register(`${exercisePath}.reps`, { valueAsNumber: true })}
            />
          </div>
          <div className="col-span-4 sm:col-span-2">
            <Label className="text-[10px] text-text-muted font-bold uppercase tracking-wider font-mono">Rest (s)</Label>
            <Input
              type="number"
              placeholder="60"
              {...form.register(`${exercisePath}.restTime`, { valueAsNumber: true })}
            />
          </div>
          <div className="col-span-4 sm:col-span-2">
            <Label className="text-[10px] text-text-muted font-bold uppercase tracking-wider font-mono">Order</Label>
            <Input
              type="number"
              placeholder="0"
              {...form.register(`${exercisePath}.order`, { valueAsNumber: true })}
            />
          </div>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="p-1 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer shrink-0 mt-5"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <div>
        <Label className="text-[10px] text-text-muted font-bold uppercase tracking-wider font-mono">Notes</Label>
        <Input
          placeholder="Optional notes"
          {...form.register(`${exercisePath}.notes`)}
          className="mt-0.5"
        />
      </div>
      {errors?.name && (
        <p className="text-xs text-destructive">{errors.name.message as string}</p>
      )}
    </div>
  );
}
