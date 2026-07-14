import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { toast } from "sonner";
import {
  ArrowLeft, Edit3, Trash2, Plus, Dumbbell, Users, Calendar,
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
    <div className="flex flex-col min-h-full bg-canvas">
      <div className="p-4 sm:p-6 lg:p-8 flex-1 w-full max-w-4xl mx-auto">
        {/* Back navigation */}
        <button
          onClick={() => navigate("/admin/workouts")}
          className="flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Workouts
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-h2 font-heading font-bold text-primary">{workout.title}</h1>
                {workout.description && (
                  <p className="text-sm text-muted mt-0.5">{workout.description}</p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <WorkoutStatusBadge isActive={workout.isActive} />
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                {workout.assignmentType === "ALL" ? "All Members" : "Selected Members"}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(`/admin/workouts/${workoutId}/edit`)}>
              <Edit3 className="w-4 h-4 mr-1.5" />
              Edit
            </Button>
            {workout.isActive && (
              <Button variant="destructive" onClick={handleDeleteWorkout}>
                <Trash2 className="w-4 h-4 mr-1.5" />
                Deactivate
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="rounded-xl border border-default bg-surface p-4">
            <div className="flex items-center gap-2 text-muted mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Days</span>
            </div>
            <p className="text-2xl font-bold text-primary">{workout.days.length}</p>
          </div>
          <div className="rounded-xl border border-default bg-surface p-4">
            <div className="flex items-center gap-2 text-muted mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Members</span>
            </div>
            <p className="text-2xl font-bold text-primary">{workout.assignedMembers.length}</p>
          </div>
          <div className="rounded-xl border border-default bg-surface p-4">
            <div className="flex items-center gap-2 text-muted mb-1">
              <Dumbbell className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Exercises</span>
            </div>
            <p className="text-2xl font-bold text-primary">
              {workout.days.reduce((sum, d) => sum + d.exercises.length, 0)}
            </p>
          </div>
        </div>

        {/* Days Section */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-primary">Workout Days</h2>
          <Button onClick={() => setShowAddDay(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            Add Day
          </Button>
        </div>

        {workout.days.length === 0 && !showAddDay ? (
          <div className="rounded-xl border border-dashed border-default p-12 text-center">
            <Dumbbell className="w-10 h-10 text-muted mx-auto mb-3" />
            <h3 className="font-semibold text-primary mb-1">No days added yet</h3>
            <p className="text-sm text-muted mb-4">
              Start building your workout by adding days with exercises.
            </p>
            <Button onClick={() => setShowAddDay(true)}>
              <Plus className="w-4 h-4 mr-1.5" />
              Add First Day
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
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

        {/* Add Day Modal */}
        <ResponsiveModal open={showAddDay} onClose={() => setShowAddDay(false)}>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-primary mb-6">Add Workout Day</h3>
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
            <h3 className="text-lg font-semibold text-primary mb-6">Edit Workout Day</h3>
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
    </div>
  );
}
