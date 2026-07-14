import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { Dumbbell, Users, Calendar, ChevronRight } from "lucide-react";
import { WorkoutListItem } from "../types";
import { WorkoutStatusBadge } from "./WorkoutStatusBadge";
import { cn } from "@/lib/utils";

interface WorkoutCardProps {
  workout: WorkoutListItem;
  index: number;
}

export function WorkoutCard({ workout, index }: WorkoutCardProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      onClick={() => navigate(`/admin/workouts/${workout.id}`)}
      className="group cursor-pointer rounded-xl border border-default bg-surface p-5 hover:shadow-md hover:border-primary/20 transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Dumbbell className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-primary truncate">{workout.title}</h3>
            {workout.description && (
              <p className="text-xs text-muted truncate mt-0.5">{workout.description}</p>
            )}
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-muted group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <WorkoutStatusBadge isActive={workout.isActive} />
        <span className={cn(
          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
          workout.assignmentType === "ALL"
            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
            : "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800",
        )}>
          {workout.assignmentType === "ALL" ? "All Members" : "Selected"}
        </span>
      </div>

      <div className="flex items-center gap-4 text-xs text-muted">
        <span className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5" />
          {workout.assignedMemberCount} member{workout.assignedMemberCount !== 1 ? "s" : ""}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          {workout.daysCount} day{workout.daysCount !== 1 ? "s" : ""}
        </span>
      </div>
    </motion.div>
  );
}
