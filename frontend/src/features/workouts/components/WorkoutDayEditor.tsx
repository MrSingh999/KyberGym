import { useState } from "react";
import { useFieldArray, UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, ChevronUp, ChevronDown, Calendar, Dumbbell } from "lucide-react";
import { ExerciseRow } from "./ExerciseRow";

interface WorkoutDayEditorProps {
  form: UseFormReturn<any>;
}

export function WorkoutDayEditor({ form }: WorkoutDayEditorProps) {
  const [activeDayTab, setActiveDayTab] = useState<number>(0);

  const {
    fields: dayFields,
    append: appendDay,
    remove: removeDay,
    swap: swapDays,
  } = useFieldArray({ control: form.control, name: "days" });

  const addDay = () => {
    appendDay({ dayName: `Day ${dayFields.length + 1}`, title: "", orderIndex: dayFields.length, exercises: [] });
    setActiveDayTab(dayFields.length);
  };

  const moveDayUp = (index: number) => {
    if (index === 0) return;
    swapDays(index, index - 1);
    const days = form.getValues("days");
    days.forEach((d: any, i: number) => {
      form.setValue(`days.${i}.orderIndex`, i);
    });
    if (activeDayTab === index) setActiveDayTab(index - 1);
  };

  const moveDayDown = (index: number) => {
    if (index === dayFields.length - 1) return;
    swapDays(index, index + 1);
    const days = form.getValues("days");
    days.forEach((d: any, i: number) => {
      form.setValue(`days.${i}.orderIndex`, i);
    });
    if (activeDayTab === index) setActiveDayTab(index + 1);
  };

  return (
    <div className="glass-panel p-5 sm:p-6 rounded-[16px] border border-border-default space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-border-default pb-4">
        <div>
          <h3 className="font-bold text-base text-text-primary flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span>Workout Days & Routines</span>
          </h3>
          <p className="text-xs text-text-secondary font-mono mt-0.5">
            Organize workout days and configure exercise sets, reps, and rest times.
          </p>
        </div>

        <Button type="button" variant="outline" size="sm" onClick={addDay} className="cursor-pointer">
          <Plus className="w-3.5 h-3.5 mr-1" /> Add Workout Day
        </Button>
      </div>

      {/* Day Selector Tabs */}
      {dayFields.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none font-mono">
          {dayFields.map((field: any, idx) => {
            const dayName = form.watch(`days.${idx}.dayName`) || `Day ${idx + 1}`;
            const exercisesCount = form.watch(`days.${idx}.exercises`)?.length || 0;
            const isActive = activeDayTab === idx;
            return (
              <button
                key={field.id}
                type="button"
                onClick={() => setActiveDayTab(idx)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-surface text-text-secondary border-border-default hover:border-border-hover"
                }`}
              >
                <span>{dayName}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-surface-hover text-text-muted"}`}>
                  {exercisesCount} ex
                </span>
              </button>
            );
          })}
        </div>
      )}

      {dayFields.length === 0 && (
        <div className="py-12 text-center border border-dashed border-border-default rounded-[12px] bg-surface/30 space-y-3">
          <Dumbbell className="h-8 w-8 text-text-muted mx-auto" />
          <p className="text-xs text-text-muted font-mono">
            No workout days configured yet. Click "Add Workout Day" to get started.
          </p>
          <Button type="button" variant="outline" size="sm" onClick={addDay}>
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Day 1
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {dayFields.map((dayField, dayIndex) => {
          // If activeDayTab is out of bounds or matching active index, show item
          const isVisible = activeDayTab === dayIndex || activeDayTab >= dayFields.length;
          if (!isVisible) return null;

          return (
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
          );
        })}
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
    <div className="border border-border-default rounded-[16px] overflow-hidden bg-surface shadow-sm">
      <div className="p-4 sm:p-5 space-y-4">
        {/* Header Bar */}
        <div className="flex items-center justify-between gap-2 border-b border-border-default/50 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md font-mono">
              Day #{dayIndex + 1}
            </span>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => moveDayUp(dayIndex)}
                disabled={dayIndex === 0}
                className="p-1 text-text-muted hover:text-text-primary disabled:opacity-30 cursor-pointer rounded hover:bg-surface-hover"
                title="Move up"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => moveDayDown(dayIndex)}
                disabled={dayIndex === dayFieldsCount - 1}
                className="p-1 text-text-muted hover:text-text-primary disabled:opacity-30 cursor-pointer rounded hover:bg-surface-hover"
                title="Move down"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => removeDay(dayIndex)}
            className="p-1.5 text-text-muted hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors cursor-pointer"
            title="Delete workout day"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-[10px] text-text-muted font-bold uppercase tracking-wider font-mono">
              Day Identifier <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="e.g. Day 1 - Push Day"
              {...form.register(`${dayPath}.dayName`)}
              className="font-mono text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] text-text-muted font-bold uppercase tracking-wider font-mono">Muscle Focus / Subtitle</Label>
            <Input
              placeholder="e.g. Upper Body (Chest, Shoulders & Triceps)"
              {...form.register(`${dayPath}.title`)}
              className="font-mono text-xs"
            />
          </div>
        </div>

        {/* Exercises Section */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold text-text-primary uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Dumbbell className="h-3.5 w-3.5 text-primary" />
              <span>Exercise Routine ({exerciseFieldArray.fields.length})</span>
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                exerciseFieldArray.append({
                  name: "",
                  sets: 4,
                  reps: 10,
                  restTime: 60,
                  notes: "",
                  order: exerciseFieldArray.fields.length,
                })
              }
              className="cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Exercise
            </Button>
          </div>

          {exerciseFieldArray.fields.length === 0 && (
            <p className="text-xs text-text-muted py-6 text-center border border-dashed border-border-default rounded-lg font-mono">
              No exercises added to this day yet. Click "Add Exercise" to configure sets and reps.
            </p>
          )}

          <div className="space-y-2.5">
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
