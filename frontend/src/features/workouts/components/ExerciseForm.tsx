import { useFieldArray, UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, GripVertical } from "lucide-react";
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
        <Label className="text-sm font-medium text-primary">Exercises</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            append({ name: "", sets: undefined, reps: undefined, duration: undefined, notes: "" })
          }
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Add Exercise
        </Button>
      </div>

      {fields.length === 0 && (
        <p className="text-sm text-muted py-4 text-center border border-dashed border-default rounded-lg">
          No exercises added yet. Click "Add Exercise" to begin.
        </p>
      )}

      <div className="space-y-3">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="relative border border-default rounded-lg p-4 bg-surface-hover/30"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-muted cursor-grab" />
                <span className="text-sm font-medium text-primary">Exercise {index + 1}</span>
              </div>
              <button
                type="button"
                onClick={() => remove(index)}
                className="p-1 text-muted hover:text-destructive transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Name */}
              <div className="sm:col-span-2">
                <Input
                  placeholder="Exercise name *"
                  {...form.register(`exercises.${index}.name`)}
                  className={form.formState.errors.exercises?.[index]?.name ? "border-destructive" : ""}
                />
                {form.formState.errors.exercises?.[index]?.name && (
                  <p className="text-xs text-destructive mt-1">
                    {form.formState.errors.exercises[index]?.name?.message}
                  </p>
                )}
              </div>

              {/* Sets */}
              <div>
                <Label className="text-xs text-muted mb-1 block">Sets</Label>
                <Input
                  type="number"
                  placeholder="e.g. 3"
                  {...form.register(`exercises.${index}.sets`, { valueAsNumber: true })}
                />
              </div>

              {/* Reps */}
              <div>
                <Label className="text-xs text-muted mb-1 block">Reps</Label>
                <Input
                  type="number"
                  placeholder="e.g. 12"
                  {...form.register(`exercises.${index}.reps`, { valueAsNumber: true })}
                />
              </div>

              {/* Duration */}
              <div>
                <Label className="text-xs text-muted mb-1 block">Duration (sec)</Label>
                <Input
                  type="number"
                  placeholder="e.g. 60"
                  {...form.register(`exercises.${index}.duration`, { valueAsNumber: true })}
                />
              </div>

              {/* Notes */}
              <div>
                <Label className="text-xs text-muted mb-1 block">Notes</Label>
                <Input
                  placeholder="Optional notes"
                  {...form.register(`exercises.${index}.notes`)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
