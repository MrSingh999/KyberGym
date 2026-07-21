import { useState, useMemo } from "react";
import { SortingState } from "@tanstack/react-table";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Plus, Dumbbell, Flame, Sparkles, Layers, UserPlus } from "lucide-react";
import { useWorkouts, useDeleteWorkout, useDuplicateWorkout, useArchiveWorkout } from "../hooks/useWorkouts";
import { useWorkoutStore } from "../store/useWorkoutStore";
import { WorkoutToolbar } from "../components/WorkoutToolbar";
import { WorkoutCard } from "../components/WorkoutCard";
import { WorkoutsTable } from "../components/WorkoutsTable";
import { WorkoutsSkeleton } from "../components/WorkoutsSkeleton";
import { EmptyWorkoutsState } from "../components/EmptyWorkoutsState";
import { AssignWorkoutModal } from "@/features/workoutAssignments/components/AssignWorkoutModal";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { WorkoutListItem } from "../types";

export function WorkoutsPage() {
  const navigate = useNavigate();
  const { searchQuery, filters, viewMode } = useWorkoutStore();
  const [sorting, setSorting] = useState<SortingState>([{ id: "createdAt", desc: true }]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignWorkoutId, setAssignWorkoutId] = useState<string | undefined>(undefined);

  const { data, isLoading } = useWorkouts({ search: searchQuery, filters, sorting });
  const { mutate: deleteWorkout } = useDeleteWorkout();
  const { mutate: duplicateWorkout } = useDuplicateWorkout();
  const { mutate: archiveWorkout } = useArchiveWorkout();

  const workouts = data ?? [];
  const totalCount = workouts.length;
  const hasSearch = searchQuery !== "" || Object.keys(filters).length > 0;

  // Compute metric stats
  const metrics = useMemo(() => {
    const activeCount = workouts.filter((w) => w.status === "ACTIVE").length;
    const strengthCount = workouts.filter((w) => (w.category || "").toLowerCase().includes("strength")).length;
    const hiitCount = workouts.filter((w) => (w.category || "").toLowerCase().includes("hiit") || (w.category || "").toLowerCase().includes("cardio")).length;
    return { activeCount, strengthCount, hiitCount };
  }, [workouts]);

  const handleDelete = (id: string) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = () => {
    if (!deleteConfirm) return;
    deleteWorkout(deleteConfirm, {
      onSuccess: () => {
        toast.success("Workout deleted");
        setDeleteConfirm(null);
      },
      onError: () => {
        toast.error("Failed to delete workout");
        setDeleteConfirm(null);
      },
    });
  };

  const handleDuplicate = (id: string) => {
    duplicateWorkout(id, {
      onSuccess: () => {
        toast.success("Workout duplicated");
      },
      onError: () => {
        toast.error("Failed to duplicate workout");
      },
    });
  };

  const handleArchive = (id: string) => {
    archiveWorkout(id, {
      onSuccess: () => {
        toast.success("Workout archived");
      },
      onError: () => {
        toast.error("Failed to archive workout");
      },
    });
  };

  const handleOpenAssign = (workout?: WorkoutListItem) => {
    setAssignWorkoutId(workout?.id);
    setAssignModalOpen(true);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in">
        <div>
          <h1 className="font-bold text-xl sm:text-2xl text-text-primary tracking-tight">
            Workout <span className="text-text-secondary font-normal ml-0.5">Library</span>
          </h1>
          <p className="text-text-secondary mt-1 text-xs font-mono">
            Create, customize, and assign reusable workout programs.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => handleOpenAssign()}
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 bg-surface hover:bg-surface-hover text-text-primary px-4 py-2.5 sm:py-2 rounded-[6px] font-semibold text-xs font-mono border border-border-default transition-all duration-200 cursor-pointer min-h-[44px] sm:min-h-0"
          >
            <UserPlus className="h-4 w-4 text-primary" />
            <span>Assign Program</span>
          </button>
          <button
            onClick={() => navigate("/admin/workouts/new")}
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 bg-primary text-primary-foreground hover:opacity-90 px-4 py-2.5 sm:py-2 rounded-[6px] font-semibold text-xs font-mono transition-all duration-200 cursor-pointer border border-border-hover min-h-[44px] sm:min-h-0 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            <span>New Workout</span>
          </button>
        </div>
      </div>

      {/* Top Analytics Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
        <div className="bg-surface border border-border-default rounded-[12px] p-3.5 flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Total Programs</p>
            <p className="text-lg font-bold text-text-primary tabular-nums">{totalCount}</p>
          </div>
        </div>

        <div className="bg-surface border border-border-default rounded-[12px] p-3.5 flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Active Templates</p>
            <p className="text-lg font-bold text-text-primary tabular-nums">{metrics.activeCount}</p>
          </div>
        </div>

        <div className="bg-surface border border-border-default rounded-[12px] p-3.5 flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
            <Dumbbell className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Strength</p>
            <p className="text-lg font-bold text-text-primary tabular-nums">{metrics.strengthCount}</p>
          </div>
        </div>

        <div className="bg-surface border border-border-default rounded-[12px] p-3.5 flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
            <Flame className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Cardio / HIIT</p>
            <p className="text-lg font-bold text-text-primary tabular-nums">{metrics.hiitCount}</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-6">
        <WorkoutToolbar totalCount={totalCount} />
      </div>

      {/* Content */}
      {isLoading ? (
        <WorkoutsSkeleton mode={viewMode} />
      ) : workouts.length === 0 ? (
        <EmptyWorkoutsState
          variant={hasSearch ? "no-search" : "no-workouts"}
          onAction={hasSearch ? undefined : () => navigate("/admin/workouts/new")}
        />
      ) : (
        <>
          {/* Desktop View */}
          <div className="hidden lg:block">
            {viewMode === "table" ? (
              <WorkoutsTable
                data={workouts}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
                onArchive={handleArchive}
                sorting={sorting}
                onSortingChange={setSorting}
              />
            ) : (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {workouts.map((workout, i) => (
                  <WorkoutCard
                    key={workout.id}
                    workout={workout}
                    index={i}
                    onDuplicate={handleDuplicate}
                    onArchive={handleArchive}
                    onDelete={handleDelete}
                    onAssign={handleOpenAssign}
                  />
                ))}
              </motion.div>
            )}
          </div>

          {/* Mobile View */}
          <div className="block lg:hidden">
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {workouts.map((workout, i) => (
                <WorkoutCard
                  key={workout.id}
                  workout={workout}
                  index={i}
                  onDuplicate={handleDuplicate}
                  onArchive={handleArchive}
                  onDelete={handleDelete}
                  onAssign={handleOpenAssign}
                />
              ))}
            </motion.div>
          </div>
        </>
      )}

      {/* Assign Workout Modal */}
      <AssignWorkoutModal
        open={assignModalOpen}
        onOpenChange={setAssignModalOpen}
        initialWorkoutId={assignWorkoutId}
      />

      {/* Delete confirmation modal */}
      <ResponsiveModal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
      >
        <div className="p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold text-primary mb-2">Delete Workout?</h3>
          <p className="text-sm text-muted mb-6">
            This will soft-delete the workout. It will no longer appear in the list. You can restore it by updating the status.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        </div>
      </ResponsiveModal>
    </div>
  );
}
