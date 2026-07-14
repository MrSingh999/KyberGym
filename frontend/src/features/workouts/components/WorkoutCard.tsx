import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { Edit, Trash2, MoreVertical, Dumbbell, Users, Calendar } from "lucide-react";
import { WorkoutListItem } from "../types";
import { WorkoutStatusBadge } from "./WorkoutStatusBadge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface WorkoutCardProps {
  workout: WorkoutListItem;
  index: number;
}

export function WorkoutCard({ workout, index }: WorkoutCardProps) {
  const navigate = useNavigate();

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/admin/workouts/${workout.id}/edit`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      onClick={() => navigate(`/admin/workouts/${workout.id}`)}
      className="glass-panel p-4 rounded-[12px] border border-border-default hover:border-border-hover hover:bg-elevated/20 transition-all duration-200 cursor-pointer relative group"
    >
      <div className="flex justify-between items-start gap-2">
        <div className="min-w-0 pr-6">
          <h4 className="font-bold text-sm text-text-primary truncate font-mono">{workout.title}</h4>
          <p className="text-[11px] text-text-secondary line-clamp-2 mt-1 leading-normal">
            {workout.description || "No description provided."}
          </p>
        </div>

        <div className="absolute top-3 right-3" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 min-w-[40px] min-h-[40px] flex items-center justify-center text-zinc-500 hover:text-text-primary rounded-[6px] hover:bg-elevated transition-colors cursor-pointer outline-none active:scale-95">
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="h-3.5 w-3.5 mr-2" />
                <span>Edit Details</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                <span>Delete Program</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-[4px] font-mono shrink-0 uppercase tracking-wider border absolute top-3.5 right-12 transition-all ${
          workout.assignmentType === "ALL"
            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 dark:border-emerald-500/15"
            : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 dark:border-indigo-500/15"
        }`}>
          {workout.assignmentType}
        </span>
      </div>

      <div className="flex justify-between items-center mt-4 pt-3 border-t border-border-default/40 text-[10px] text-text-muted font-mono">
        <div className="flex space-x-3">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {workout.daysCount} day{workout.daysCount !== 1 ? "s" : ""}
          </span>
          {workout.assignmentType === "SELECTED" && (
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {workout.assignedMemberCount} assigned
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <WorkoutStatusBadge isActive={workout.isActive} />
        </div>
      </div>
    </motion.div>
  );
}
