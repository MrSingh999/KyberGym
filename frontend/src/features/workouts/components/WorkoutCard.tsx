import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { MoreVertical, Calendar, Clock, Target } from "lucide-react";
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
  onDuplicate?: (id: string) => void;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function WorkoutCard({ workout, index, onDuplicate, onArchive, onDelete }: WorkoutCardProps) {
  const navigate = useNavigate();

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/admin/workouts/${workout.id}/edit`);
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDuplicate?.(workout.id);
  };

  const handleArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    onArchive?.(workout.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(workout.id);
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
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-bold text-sm text-text-primary truncate font-mono">{workout.title}</h4>
            <WorkoutStatusBadge status={workout.status} />
          </div>
          <p className="text-[11px] text-text-secondary line-clamp-2 leading-normal">
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
                <span>View / Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDuplicate}>
                <span>Duplicate</span>
              </DropdownMenuItem>
              {workout.status !== "ARCHIVED" && (
                <DropdownMenuItem onClick={handleArchive}>
                  <span>Archive</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={handleDelete}>
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-2 pt-2 text-[10px] text-text-muted font-mono border-t border-border-default/40">
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {workout.daysCount} day{workout.daysCount !== 1 ? "s" : ""}
        </span>
        {workout.goal && (
          <span className="flex items-center gap-1">
            <Target className="h-3 w-3" />
            {workout.goal}
          </span>
        )}
        {workout.estimatedDuration && (
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {workout.estimatedDuration}m
          </span>
        )}
      </div>
    </motion.div>
  );
}
