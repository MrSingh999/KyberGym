import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WorkoutDay } from "../types";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, ChevronDown, ChevronUp, Timer, Repeat, Dumbbell } from "lucide-react";

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
      className="border border-border-default rounded-[8px] overflow-hidden bg-surface/20"
    >
      <div
        className="flex justify-between items-center p-3.5 bg-surface/45 cursor-pointer hover:bg-surface/65 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center space-x-3 min-w-0">
          <span className="bg-primary text-primary-foreground text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center font-mono">
            {day.orderIndex + 1}
          </span>
          <div className="min-w-0">
            <h4 className="font-semibold text-xs text-text-primary font-mono">
              {day.dayName}{day.title ? ` — ${day.title}` : ""}
            </h4>
            <p className="text-[10px] text-text-muted mt-0.5 font-mono">
              {day.exercises.length} Exercise{day.exercises.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0" onClick={(e) => e.stopPropagation()}>
          {onEdit && (
            <button
              onClick={() => onEdit(day)}
              className="p-1 text-zinc-500 hover:text-text-primary cursor-pointer"
              title="Edit Day"
            >
              <Edit className="h-3.5 w-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(day._id!)}
              className="p-1 text-zinc-500 hover:text-red-400 cursor-pointer"
              title="Delete Day"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 text-zinc-500 hover:text-text-primary cursor-pointer"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-border-default/50 bg-surface/10 p-4 space-y-4"
          >
            {day.exercises.length === 0 ? (
              <p className="text-[11px] text-text-muted italic text-center py-4">No exercises configured for this day.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {day.exercises.map((exercise, ei) => (
                  <div
                    key={ei}
                    className="bg-surface/45 border border-border-default p-3 rounded-[6px] space-y-2 hover:border-border-hover transition-all relative group"
                  >
                    <div className="flex justify-between items-start gap-1">
                      <div className="min-w-0">
                        <h6 className="font-bold text-xs text-text-primary truncate font-mono">{exercise.name}</h6>
                        <div className="flex flex-wrap gap-x-2 text-[10px] text-text-secondary font-mono mt-1">
                          {exercise.sets && <span>{exercise.sets} Sets</span>}
                          {exercise.sets && exercise.reps && <span>&bull;</span>}
                          {exercise.reps && <span>{exercise.reps} Reps</span>}
                          {exercise.restTime && (
                            <>
                              <span>&bull;</span>
                              <span className="flex items-center gap-0.5">
                                <Timer className="h-3 w-3" /> {exercise.restTime}s
                              </span>
                            </>
                          )}
                          {exercise.duration && (
                            <>
                              <span>&bull;</span>
                              <span>{exercise.duration}s</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {exercise.notes && (
                      <p className="text-[10px] text-text-muted leading-relaxed pt-1 bg-surface/20 px-2 py-1 rounded">
                        {exercise.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 px-0 py-2 border-t border-border-default/40">
              {onEdit && (
                <Button variant="ghost" size="sm" onClick={() => onEdit(day)}>
                  <Edit className="w-3.5 h-3.5 mr-1" />
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => onDelete(day._id!)}>
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  Remove
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
