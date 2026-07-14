import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { toast } from "sonner";
import {
  ArrowLeft, Edit3, Trash2, Plus, Dumbbell, Users, Calendar, Check, X, UserPlus,
} from "lucide-react";
import { useWorkout, useDeleteWorkout, useCreateWorkoutDay, useUpdateWorkoutDay, useDeleteWorkoutDay } from "../hooks/useWorkouts";
import { WorkoutStatusBadge } from "../components/WorkoutStatusBadge";
import { WorkoutDayCard } from "../components/WorkoutDayCard";
import { WorkoutDayForm } from "../components/WorkoutDayForm";
import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Skeleton } from "@/components/feedback/Skeleton";
import { ErrorState } from "@/components/feedback/ErrorState";
import { WorkoutDay } from "../types";
import { WorkoutDayFormData } from "../schemas/workout.schema";

export function WorkoutDetailPage() {
  const { workoutId } = useParams();
  const navigate = useNavigate();
  const { data: workout, isLoading, isError } = useWorkout(workoutId!);
  const { mutate: deleteWorkout } = useDeleteWorkout();
  const { mutate: createDay, isPending: isCreatingDay } = useCreateWorkoutDay(workoutId!);
  const { mutate: updateDay, isPending: isUpdatingDay } = useUpdateWorkoutDay(workoutId!);
  const { mutate: deleteDay } = useDeleteWorkoutDay(workoutId!);

  const [showAddDay, setShowAddDay] = useState(false);
  const [editingDay, setEditingDay] = useState<WorkoutDay | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleDeleteWorkout = () => {
    if (!workoutId) return;
    deleteWorkout(workoutId, {
      onSuccess: () => {
        toast.success("Workout deactivated");
        navigate("/admin/workouts");
      },
      onError: () => toast.error("Failed to deactivate workout"),
    });
  };

  const handleAddDay = (data: WorkoutDayFormData) => {
    createDay(data as any, {
      onSuccess: () => {
        toast.success("Day added successfully");
        setShowAddDay(false);
      },
      onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to add day"),
    });
  };

  const handleEditDay = (day: WorkoutDay) => {
    setEditingDay(day);
  };

  const handleUpdateDay = (data: WorkoutDayFormData) => {
    if (!editingDay?.id) return;
    updateDay(
      { dayId: editingDay.id, data },
      {
        onSuccess: () => {
          toast.success("Day updated successfully");
          setEditingDay(null);
        },
        onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to update day"),
      },
    );
  };

  const handleDeleteDay = (dayId: string) => {
    setDeleteConfirm(dayId);
  };

  const confirmDeleteDay = () => {
    if (!deleteConfirm) return;
    deleteDay(deleteConfirm, {
      onSuccess: () => {
        toast.success("Day removed");
        setDeleteConfirm(null);
      },
      onError: () => {
        toast.error("Failed to remove day");
        setDeleteConfirm(null);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-72" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  if (isError || !workout) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        <ErrorState
          title="Workout not found"
          message="The workout you're looking for doesn't exist or has been removed."
          onRetry={() => navigate("/admin/workouts")}
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-4xl mx-auto space-y-6">
      {/* Back navigation */}
      <button
        onClick={() => navigate("/admin/workouts")}
        className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors mb-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Workouts
      </button>

      {/* Glass-panel detail card */}
      <div className="glass-panel p-5 sm:p-6 rounded-[16px] border border-border-hover space-y-4">
        {/* Header with title and actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-border-default/40">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h2 className="font-bold text-lg sm:text-xl text-text-primary font-mono">{workout.title}</h2>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-[4px] font-mono uppercase border ${
                workout.assignmentType === "ALL"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 dark:border-emerald-500/15"
                  : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 dark:border-indigo-500/15"
              }`}>
                {workout.assignmentType === "ALL" ? "Assigned to All Members" : "Personal Assignment"}
              </span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              {workout.description || "No description provided."}
            </p>
          </div>

          <div className="flex items-center space-x-1.5 shrink-0 self-end sm:self-center">
            <button
              onClick={() => navigate(`/admin/workouts/${workoutId}/edit`)}
              className="p-2 border border-border-default rounded-[6px] text-text-secondary hover:text-text-primary hover:bg-elevated hover:border-border-hover cursor-pointer"
              title="Edit Details"
            >
              <Edit3 className="h-4 w-4" />
            </button>
            <button
              onClick={handleDeleteWorkout}
              className="p-2 border border-border-default rounded-[6px] text-text-secondary hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 cursor-pointer"
              title="Delete Program"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-[12px] border border-border-default bg-surface p-4">
            <div className="flex items-center gap-2 text-text-muted mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Days</span>
            </div>
            <p className="text-2xl font-bold text-text-primary font-mono">{workout.days.length}</p>
          </div>
          <div className="rounded-[12px] border border-border-default bg-surface p-4">
            <div className="flex items-center gap-2 text-text-muted mb-1">
              <Users className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Members</span>
            </div>
            <p className="text-2xl font-bold text-text-primary font-mono">{workout.assignedMembers.length}</p>
          </div>
          <div className="rounded-[12px] border border-border-default bg-surface p-4">
            <div className="flex items-center gap-2 text-text-muted mb-1">
              <Dumbbell className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Exercises</span>
            </div>
            <p className="text-2xl font-bold text-text-primary font-mono">
              {workout.days.reduce((sum, d) => sum + d.exercises.length, 0)}
            </p>
          </div>
        </div>

        {/* Assigned Members section (for SELECTED type) */}
        {workout.assignmentType === "SELECTED" && (
          <div className="bg-surface/25 border border-border-default rounded-[8px] p-4 space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-text-secondary" />
                <h4 className="font-bold text-xs text-text-primary font-mono uppercase tracking-wider">
                  Assigned Members ({workout.assignedMembers.length})
                </h4>
              </div>
            </div>

            {workout.assignedMembers.length === 0 ? (
              <p className="text-[11px] text-text-muted italic">No members assigned yet. This routine won't be visible to anyone.</p>
            ) : (
              <div className="flex flex-wrap gap-2 pt-1 max-h-[120px] overflow-y-auto pr-1">
                {workout.assignedMembers.map((memberId) => (
                  <div
                    key={memberId}
                    className="flex items-center space-x-1.5 bg-surface/50 border border-border-hover pl-2 pr-1 py-0.5 rounded-[4px] text-[10px] text-text-secondary font-mono"
                  >
                    <span>{memberId}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Day-wise Schedule */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm text-text-primary font-mono uppercase tracking-wider">
              Day-wise Schedule
            </h3>
            <button
              onClick={() => setShowAddDay(true)}
              className="flex items-center space-x-1 bg-surface/55 border border-border-default hover:border-border-hover text-text-secondary hover:text-text-primary px-3 py-1.5 rounded-[6px] text-xs font-bold transition-all cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Day</span>
            </button>
          </div>

          {workout.days.length === 0 && !showAddDay ? (
            <div className="border border-dashed border-border-hover p-8 text-center rounded-[8px] text-text-muted text-xs italic">
              No training days configured. Click "Add Day" to define routines like chest, back, legs split.
            </div>
          ) : (
            <div className="space-y-2">
              {workout.days.map((day, i) => (
                <WorkoutDayCard
                  key={day.id}
                  day={day}
                  index={i}
                  onEdit={handleEditDay}
                  onDelete={handleDeleteDay}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {/* Add Day Modal */}
      <ResponsiveModal open={showAddDay} onClose={() => setShowAddDay(false)}>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-primary mb-6">Add Training Day</h3>
          <WorkoutDayForm
            onSubmit={handleAddDay}
            isSubmitting={isCreatingDay}
            onCancel={() => setShowAddDay(false)}
          />
        </div>
      </ResponsiveModal>

      {/* Edit Day Modal */}
      <ResponsiveModal open={!!editingDay} onClose={() => setEditingDay(null)}>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-primary mb-6">Edit Training Day</h3>
          {editingDay && (
            <WorkoutDayForm
              defaultValues={{
                dayNumber: editingDay.dayNumber,
                dayName: editingDay.dayName,
                title: editingDay.title,
                exercises: editingDay.exercises,
              }}
              onSubmit={handleUpdateDay}
              isSubmitting={isUpdatingDay}
              onCancel={() => setEditingDay(null)}
            />
          )}
        </div>
      </ResponsiveModal>

      {/* Delete Day Confirmation */}
      <ResponsiveModal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <div className="p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-6 h-6 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold text-primary mb-2">Remove Day?</h3>
          <p className="text-sm text-muted mb-6">
            This will permanently remove this day and its exercises from the workout.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteDay}>
              Remove
            </Button>
          </div>
        </div>
      </ResponsiveModal>
    </div>
  );
}
