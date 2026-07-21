import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { toast } from "sonner";
import {
  ArrowLeft, Edit3, Trash2, Plus, Dumbbell, Calendar, Clock, Target, Copy, Archive,
} from "lucide-react";
import { useWorkout, useDeleteWorkout, useDuplicateWorkout, useArchiveWorkout, useCreateWorkoutDay, useUpdateWorkoutDay, useDeleteWorkoutDay } from "../hooks/useWorkouts";
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
  const { mutate: duplicateWorkout } = useDuplicateWorkout();
  const { mutate: archiveWorkout } = useArchiveWorkout();
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
        toast.success("Workout deleted");
        navigate("/admin/workouts");
      },
      onError: () => toast.error("Failed to delete workout"),
    });
  };

  const handleDuplicate = () => {
    if (!workoutId) return;
    duplicateWorkout(workoutId, {
      onSuccess: (res) => {
        toast.success("Workout duplicated");
        navigate(`/admin/workouts/${res._id || res.id}`);
      },
      onError: () => toast.error("Failed to duplicate workout"),
    });
  };

  const handleArchive = () => {
    if (!workoutId) return;
    archiveWorkout(workoutId, {
      onSuccess: () => {
        toast.success("Workout archived");
      },
      onError: () => toast.error("Failed to archive workout"),
    });
  };

  const handleAddDay = (data: WorkoutDayFormData) => {
    createDay(data as any, {
      onSuccess: () => {
        toast.success("Day added");
        setShowAddDay(false);
      },
      onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to add day"),
    });
  };

  const handleEditDay = (day: WorkoutDay) => {
    setEditingDay(day);
  };

  const handleUpdateDay = (data: WorkoutDayFormData) => {
    if (!editingDay?._id) return;
    updateDay(
      { dayId: editingDay._id, data },
      {
        onSuccess: () => {
          toast.success("Day updated");
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
      <button
        onClick={() => navigate("/admin/workouts")}
        className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors mb-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Workouts
      </button>

      <div className="glass-panel p-5 sm:p-6 rounded-[16px] border border-border-hover space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-border-default/40">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h2 className="font-bold text-lg sm:text-xl text-text-primary font-mono">{workout.title}</h2>
              <WorkoutStatusBadge status={workout.status} />
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
              onClick={handleDuplicate}
              className="p-2 border border-border-default rounded-[6px] text-text-secondary hover:text-text-primary hover:bg-elevated hover:border-border-hover cursor-pointer"
              title="Duplicate"
            >
              <Copy className="h-4 w-4" />
            </button>
            {workout.status !== "ARCHIVED" && (
              <button
                onClick={handleArchive}
                className="p-2 border border-border-default rounded-[6px] text-text-secondary hover:text-amber-600 hover:bg-amber-500/10 hover:border-amber-500/20 cursor-pointer"
                title="Archive"
              >
                <Archive className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={handleDeleteWorkout}
              className="p-2 border border-border-default rounded-[6px] text-text-secondary hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 cursor-pointer"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="rounded-[12px] border border-border-default bg-surface p-4">
            <div className="flex items-center gap-2 text-text-muted mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Days</span>
            </div>
            <p className="text-2xl font-bold text-text-primary font-mono">{workout.days.length}</p>
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
          <div className="rounded-[12px] border border-border-default bg-surface p-4">
            <div className="flex items-center gap-2 text-text-muted mb-1">
              <Target className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Goal</span>
            </div>
            <p className="text-sm font-bold text-text-primary font-mono truncate">
              {workout.goal || "—"}
            </p>
          </div>
          <div className="rounded-[12px] border border-border-default bg-surface p-4">
            <div className="flex items-center gap-2 text-text-muted mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Duration</span>
            </div>
            <p className="text-2xl font-bold text-text-primary font-mono">
              {workout.estimatedDuration ? `${workout.estimatedDuration}m` : "—"}
            </p>
          </div>
        </div>

        {/* Category */}
        {workout.category && (
          <div className="flex items-center gap-2 text-xs text-text-muted font-mono">
            <span className="text-[10px] font-bold uppercase tracking-wider">Category:</span>
            <span className="bg-surface/50 px-2 py-0.5 rounded border border-border-default">
              {workout.category}
            </span>
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
              No training days configured. Click "Add Day" to define routines.
            </div>
          ) : (
            <div className="space-y-2">
              {workout.days.map((day, i) => (
                <WorkoutDayCard
                  key={day._id}
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

      {/* Add Day Modal */}
      <ResponsiveModal open={showAddDay} onClose={() => setShowAddDay(false)}>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-primary mb-6">Add Training Day</h3>
          <WorkoutDayForm
            defaultValues={{
              orderIndex: workout?.days?.length || 0,
            }}
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
                orderIndex: editingDay.orderIndex,
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
