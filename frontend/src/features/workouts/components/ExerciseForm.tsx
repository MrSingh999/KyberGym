import { useFieldArray, UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { WorkoutDayFormData } from "../schemas/workout.schema";

interface ExerciseFormProps {
  form: UseFormReturn<WorkoutDayFormData>;
}

export function ExerciseForm({ form }: ExerciseFormProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "exercises",
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-[10px] text-text-muted font-bold uppercase tracking-wider font-mono">Exercises</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            append({ name: "", sets: undefined, reps: undefined, restTime: undefined, notes: "", order: fields.length })
          }
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Add Exercise
        </Button>
      </div>

      {fields.length === 0 && (
        <p className="text-sm text-text-muted py-4 text-center border border-dashed border-border-default rounded-lg">
          No exercises added yet. Click "Add Exercise" to begin.
        </p>
      )}

      <div className="space-y-3">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="bg-surface/45 border border-border-default p-3 rounded-[6px] space-y-2 relative group"
          >
            <div className="flex items-start justify-between gap-1">
              <div className="min-w-0 flex-1">
                <Input
                  placeholder="Exercise name *"
                  {...form.register(`exercises.${index}.name`)}
                  className={form.formState.errors.exercises?.[index]?.name ? "border-destructive" : ""}
                />

                <div className="grid grid-cols-4 gap-2 mt-2">
                  <div>
                    <Label className="text-[10px] text-text-muted font-bold uppercase tracking-wider font-mono">Sets</Label>
                    <Input
                      type="number"
                      placeholder="4"
                      className="mt-0.5 text-center font-mono"
                      {...form.register(`exercises.${index}.sets`, { valueAsNumber: true })}
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] text-text-muted font-bold uppercase tracking-wider font-mono">Reps</Label>
                    <Input
                      type="number"
                      placeholder="10"
                      className="mt-0.5 text-center font-mono"
                      {...form.register(`exercises.${index}.reps`, { valueAsNumber: true })}
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] text-text-muted font-bold uppercase tracking-wider font-mono">Rest (s)</Label>
                    <Input
                      type="number"
                      placeholder="60"
                      className="mt-0.5 text-center font-mono"
                      {...form.register(`exercises.${index}.restTime`, { valueAsNumber: true })}
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] text-text-muted font-bold uppercase tracking-wider font-mono">Order</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      className="mt-0.5 text-center font-mono"
                      {...form.register(`exercises.${index}.order`, { valueAsNumber: true })}
                    />
                  </div>
                </div>

                <div className="mt-2">
                  <Label className="text-[10px] text-text-muted font-bold uppercase tracking-wider font-mono">Notes</Label>
                  <Input
                    placeholder="Optional notes"
                    className="mt-0.5"
                    {...form.register(`exercises.${index}.notes`)}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => remove(index)}
                className="p-1 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer shrink-0 mt-1"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
