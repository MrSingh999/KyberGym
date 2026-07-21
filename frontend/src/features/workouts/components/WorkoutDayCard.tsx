import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WorkoutDay } from "../types";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, ChevronDown, ChevronUp, Timer, Repeat, Dumbbell, Video, Image as ImageIcon, ExternalLink } from "lucide-react";

interface WorkoutDayCardProps {
  day: WorkoutDay;
  index: number;
  onEdit?: (day: WorkoutDay) => void;
  onDelete?: (dayId: string) => void;
}

export function WorkoutDayCard({ day, index, onEdit, onDelete }: WorkoutDayCardProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className="border border-border-default rounded-[16px] overflow-hidden bg-surface shadow-sm"
    >
      <div
        className="flex justify-between items-center p-4 bg-surface-hover/40 cursor-pointer hover:bg-surface-hover transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center space-x-3 min-w-0">
          <span className="bg-primary text-primary-foreground text-xs font-black w-7 h-7 rounded-full flex items-center justify-center font-mono shrink-0">
            {day.orderIndex + 1}
          </span>
          <div className="min-w-0">
            <h4 className="font-bold text-sm text-text-primary font-mono truncate">
              {day.dayName}{day.title ? ` — ${day.title}` : ""}
            </h4>
            <p className="text-[11px] text-text-muted mt-0.5 font-mono">
              {day.exercises.length} Exercise{day.exercises.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          {onEdit && (
            <button
              onClick={() => onEdit(day)}
              className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center text-text-muted hover:text-text-primary rounded-md hover:bg-surface-hover transition-colors cursor-pointer"
              title="Edit Day"
            >
              <Edit className="h-4 w-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(day._id!)}
              className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center text-text-muted hover:text-destructive rounded-md hover:bg-destructive/10 transition-colors cursor-pointer"
              title="Delete Day"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center text-text-muted hover:text-text-primary rounded-md hover:bg-surface-hover transition-colors cursor-pointer"
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
            className="border-t border-border-default/50 bg-surface/30 p-4 space-y-4"
          >
            {day.exercises.length === 0 ? (
              <p className="text-xs text-text-muted italic text-center py-6 font-mono">No exercises configured for this day.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {day.exercises.map((exercise, ei) => (
                  <div
                    key={ei}
                    className="bg-surface border border-border-default p-3.5 rounded-[12px] space-y-2 hover:border-border-hover transition-all"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <h6 className="font-bold text-xs text-text-primary truncate font-mono flex items-center gap-1.5">
                          <Dumbbell className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="truncate">{exercise.name}</span>
                        </h6>

                        <div className="flex flex-wrap gap-2 text-[10px] text-text-secondary font-mono mt-1.5">
                          {exercise.sets && (
                            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded font-semibold">
                              {exercise.sets} Sets
                            </span>
                          )}
                          {exercise.reps && (
                            <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-semibold">
                              {exercise.reps} Reps
                            </span>
                          )}
                          {exercise.restTime && (
                            <span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                              <Timer className="h-3 w-3" /> {exercise.restTime}s Rest
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Video / Image Indicators */}
                      <div className="flex items-center gap-1 shrink-0">
                        {exercise.videoUrl && (
                          <a
                            href={exercise.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-md transition-colors text-[10px] font-mono flex items-center gap-1"
                            title="Watch YouTube Demo"
                          >
                            <Video className="h-3.5 w-3.5" />
                            <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        )}
                        {exercise.image && (
                          <a
                            href={exercise.image}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-md transition-colors text-[10px] font-mono flex items-center gap-1"
                            title="View Exercise Diagram / GIF"
                          >
                            <ImageIcon className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </div>

                    {exercise.notes && (
                      <p className="text-[11px] text-text-secondary leading-relaxed pt-1.5 border-t border-border-default/30 font-mono">
                        {exercise.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
