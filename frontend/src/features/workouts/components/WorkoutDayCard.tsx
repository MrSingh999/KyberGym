import { useState } from "react";
import { motion } from "framer-motion";
import { WorkoutDay } from "../types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Pencil, Trash2, Timer, Repeat, Dumbbell } from "lucide-react";

interface WorkoutDayCardProps {
  day: WorkoutDay;
  index: number;
  onEdit?: (day: WorkoutDay) => void;
  onDelete?: (dayId: string) => void;
}

export function WorkoutDayCard({ day, index, onEdit, onDelete }: WorkoutDayCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className="border border-default rounded-xl bg-surface overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-surface-hover transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
            {day.dayNumber}
          </div>
          <div className="text-left">
            <h4 className="font-semibold text-primary">{day.dayName}</h4>
            {day.title && (
              <p className="text-xs text-muted">{day.title}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {day.exercises.length} exercise{day.exercises.length !== 1 ? "s" : ""}
          </Badge>
          {expanded ? <ChevronUp className="w-4 h-4 text-muted" /> : <ChevronDown className="w-4 h-4 text-muted" />}
        </div>
      </button>

      {/* Exercises */}
      {expanded && (
        <div className="border-t border-default">
          {day.exercises.length === 0 ? (
            <p className="text-sm text-muted py-6 text-center">No exercises in this day.</p>
          ) : (
            <div className="divide-y divide-default">
              {day.exercises.map((exercise, ei) => (
                <div key={ei} className="px-4 py-3 hover:bg-surface-hover/50 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <Dumbbell className="w-3.5 h-3.5 text-primary" />
                    <span className="font-medium text-sm text-primary">{exercise.name}</span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-muted ml-5.5">
                    {exercise.sets && (
                      <span className="flex items-center gap-1">
                        <Repeat className="w-3 h-3" />
                        {exercise.sets} sets
                      </span>
                    )}
                    {exercise.reps && (
                      <span>{exercise.reps} reps</span>
                    )}
                    {exercise.duration && (
                      <span className="flex items-center gap-1">
                        <Timer className="w-3 h-3" />
                        {exercise.duration}s
                      </span>
                    )}
                    {exercise.notes && (
                      <span className="italic">{exercise.notes}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 px-4 py-3 border-t border-default bg-surface-hover/30">
            {onEdit && (
              <Button variant="ghost" size="sm" onClick={() => onEdit(day)}>
                <Pencil className="w-3.5 h-3.5 mr-1" />
                Edit
              </Button>
            )}
            {onDelete && (
              <Button variant="ghost" size="sm" className="text-destructive" onClick={() => onDelete(day.id!)}>
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                Remove
              </Button>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
