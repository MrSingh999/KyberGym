import { useFieldArray, UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { ExerciseRow } from "./ExerciseRow";

interface WorkoutDayEditorProps {
  form: UseFormReturn<any>;
}

export function WorkoutDayEditor({ form }: WorkoutDayEditorProps) {
  const {
    fields: dayFields,
    append: appendDay,
    remove: removeDay,
    swap: swapDays,
  } = useFieldArray({ control: form.control, name: "days" });

  const addDay = () => {
    appendDay({ dayName: "", title: "", orderIndex: dayFields.length, exercises: [] });
  };

  const moveDayUp = (index: number) => {
    if (index === 0) return;
    swapDays(index, index - 1);
    const days = form.getValues("days");
    days.forEach((d: any, i: number) => {
      form.setValue(`days.${i}.orderIndex`, i);
    });
  };

  const moveDayDown = (index: number) => {
    if (index === dayFields.length - 1) return;
    swapDays(index, index + 1);
    const days = form.getValues("days");
    days.forEach((d: any, i: number) => {
      form.setValue(`days.${i}.orderIndex`, i);
    });
  };

  return (
    <div className="glass-panel p-5 sm:p-6 rounded-[16px] border border-border-hover space-y-5">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-sm text-text-primary font-mono uppercase tracking-wider">Workout Days</h3>
        <Button type="button" variant="outline" size="sm" onClick={addDay}>
          <Plus className="w-3.5 h-3.5 mr-1" /> Add Day
        </Button>
      </div>

      {dayFields.length === 0 && (
        <p className="text-sm text-text-muted py-8 text-center border border-dashed border-border-default rounded-lg">
          No days configured. Click "Add Day" to start building your workout.
        </p>
      )}

      <div className="space-y-4">
        {dayFields.map((dayField, dayIndex) => (
          <WorkoutDayItem
            key={dayField.id}
            form={form}
            dayField={dayField}
            dayIndex={dayIndex}
            moveDayUp={moveDayUp}
            moveDayDown={moveDayDown}
            removeDay={removeDay}
            dayFieldsCount={dayFields.length}
          />
        ))}
      </div>
    </div>
  );
}

interface WorkoutDayItemProps {
  form: UseFormReturn<any>;
  dayField: any;
  dayIndex: number;
  moveDayUp: (index: number) => void;
  moveDayDown: (index: number) => void;
  removeDay: (index: number) => void;
  dayFieldsCount: number;
}

function WorkoutDayItem({
  form,
  dayField,
  dayIndex,
  moveDayUp,
  moveDayDown,
  removeDay,
  dayFieldsCount,
}: WorkoutDayItemProps) {
  const dayPath = `days.${dayIndex}`;
  const exerciseFieldArray = useFieldArray({
    control: form.control,
    name: `${dayPath}.exercises`,
  });

  return (
    <div
      className="border border-border-default rounded-[8px] overflow-hidden bg-surface/20"
    >
      <div className="bg-surface/45 p-3.5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => moveDayUp(dayIndex)}
              disabled={dayIndex === 0}
              className="p-1 text-zinc-500 hover:text-text-primary disabled:opacity-30 cursor-pointer"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => moveDayDown(dayIndex)}
              disabled={dayIndex === dayFieldsCount - 1}
              className="p-1 text-zinc-500 hover:text-text-primary disabled:opacity-30 cursor-pointer"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
            <span className="text-[10px] font-bold text-text-muted font-mono ml-1">
              #{dayIndex + 1}
            </span>
          </div>
          <button
            type="button"
            onClick={() => removeDay(dayIndex)}
            className="p-1 text-zinc-500 hover:text-red-400 cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-[10px] text-text-muted font-bold uppercase tracking-wider font-mono">
              Day Name <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="e.g. Push Day"
              {...form.register(`${dayPath}.dayName`)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] text-text-muted font-bold uppercase tracking-wider font-mono">Focus / Title</Label>
            <Input
              placeholder="e.g. Chest & Triceps"
              {...form.register(`${dayPath}.title`)}
            />
          </div>
        </div>

        {/* Exercises */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <Label className="text-[10px] text-text-muted font-bold uppercase tracking-wider font-mono">Exercises</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                exerciseFieldArray.append({
                  name: "",
                  sets: undefined,
                  reps: undefined,
                  restTime: undefined,
                  notes: "",
                  order: exerciseFieldArray.fields.length,
                })
              }
            >
              <Plus className="w-3 h-3 mr-1" /> Add Exercise
            </Button>
          </div>

          {exerciseFieldArray.fields.length === 0 && (
            <p className="text-xs text-text-muted py-3 text-center border border-dashed border-border-default rounded-lg">
              No exercises for this day.
            </p>
          )}

          <div className="space-y-2">
            {exerciseFieldArray.fields.map((exField, exIndex) => (
              <ExerciseRow
                key={exField.id}
                form={form}
                dayIndex={dayIndex}
                exerciseIndex={exIndex}
                onRemove={() => exerciseFieldArray.remove(exIndex)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
