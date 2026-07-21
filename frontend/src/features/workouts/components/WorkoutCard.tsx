import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { MoreVertical, Calendar, Clock, Target, Dumbbell, Flame, Heart, Sparkles, UserPlus, Layers } from "lucide-react";
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
  onAssign?: (workout: WorkoutListItem) => void;
}

function getCategoryBadge(category?: string) {
  const cat = (category || "").toLowerCase();
  if (cat.includes("hiit") || cat.includes("cardio") || cat.includes("fat loss")) {
    return { label: category || "HIIT / Cardio", icon: Flame, color: "text-amber-500 bg-amber-500/10 border-amber-500/20" };
  }
  if (cat.includes("strength") || cat.includes("power") || cat.includes("muscle")) {
    return { label: category || "Strength", icon: Dumbbell, color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" };
  }
  if (cat.includes("endurance") || cat.includes("stamina")) {
    return { label: category || "Endurance", icon: Heart, color: "text-rose-500 bg-rose-500/10 border-rose-500/20" };
  }
  if (cat.includes("hypertrophy") || cat.includes("bodybuilding")) {
    return { label: category || "Hypertrophy", icon: Sparkles, color: "text-purple-400 bg-purple-500/10 border-purple-500/20" };
  }
  return { label: category || "General Workout", icon: Layers, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" };
}

export function WorkoutCard({ workout, index, onDuplicate, onArchive, onDelete, onAssign }: WorkoutCardProps) {
  const navigate = useNavigate();
  const badge = getCategoryBadge(workout.category);
  const CategoryIcon = badge.icon;

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

  const handleAssign = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAssign) {
      onAssign(workout);
    } else {
      navigate(`/admin/assignments?workoutId=${workout.id}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      onClick={() => navigate(`/admin/workouts/${workout.id}`)}
      className="p-5 rounded-[16px] bg-surface border border-border-default hover:border-border-hover hover:shadow-lg transition-all duration-200 cursor-pointer relative group flex flex-col justify-between"
    >
      <div className="space-y-3">
        {/* Header Badges & Actions */}
        <div className="flex items-center justify-between gap-2">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold font-mono border ${badge.color}`}>
            <CategoryIcon className="h-3 w-3" />
            <span className="capitalize">{badge.label}</span>
          </span>

          <div className="flex items-center gap-1">
            <WorkoutStatusBadge status={workout.status} />
            <div onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button 
                    aria-label="Workout Actions"
                    className="p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center text-text-muted hover:text-text-primary rounded-[6px] hover:bg-surface-hover transition-colors cursor-pointer outline-none"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem onClick={handleEdit}>
                    <span>View / Edit Plan</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleAssign}>
                    <UserPlus className="h-3.5 w-3.5 mr-2 text-primary" />
                    <span>Assign to Member</span>
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
        </div>

        {/* Title & Description */}
        <div>
          <h4 className="font-bold text-base text-text-primary group-hover:text-primary transition-colors line-clamp-1">
            {workout.title}
          </h4>
          <p className="text-xs text-text-secondary line-clamp-2 mt-1 leading-relaxed">
            {workout.description || "No description provided."}
          </p>
        </div>
      </div>

      {/* Footer Metrics & Actions */}
      <div className="mt-4 pt-3 border-t border-border-default/50 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 text-[11px] text-text-muted font-mono">
          <span className="flex items-center gap-1 text-text-secondary font-medium">
            <Calendar className="h-3.5 w-3.5 text-text-muted" />
            {workout.daysCount} day{workout.daysCount !== 1 ? "s" : ""}
          </span>
          {workout.estimatedDuration && (
            <span className="flex items-center gap-1 text-text-secondary font-medium">
              <Clock className="h-3.5 w-3.5 text-text-muted" />
              {workout.estimatedDuration}m
            </span>
          )}
          {workout.goal && (
            <span className="hidden sm:flex items-center gap-1 text-text-muted truncate max-w-[100px]">
              <Target className="h-3.5 w-3.5" />
              <span className="truncate">{workout.goal}</span>
            </span>
          )}
        </div>

        <button
          onClick={handleAssign}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-xs font-semibold bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground border border-primary/20 transition-all duration-150 cursor-pointer min-h-[36px]"
        >
          <UserPlus className="h-3.5 w-3.5" />
          <span>Assign</span>
        </button>
      </div>
    </motion.div>
  );
}
