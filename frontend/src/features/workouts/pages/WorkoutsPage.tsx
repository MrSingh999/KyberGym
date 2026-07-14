import { useState } from "react";
import { SortingState } from "@tanstack/react-table";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useWorkouts, useDeleteWorkout } from "../hooks/useWorkouts";
import { useWorkoutStore } from "../store/useWorkoutStore";
import { WorkoutToolbar } from "../components/WorkoutToolbar";
import { WorkoutCard } from "../components/WorkoutCard";
import { WorkoutsTable } from "../components/WorkoutsTable";
import { WorkoutsSkeleton } from "../components/WorkoutsSkeleton";
import { EmptyWorkoutsState } from "../components/EmptyWorkoutsState";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export function WorkoutsPage() {
  const navigate = useNavigate();
  const { searchQuery, filters, viewMode } = useWorkoutStore();
  const [sorting, setSorting] = useState<SortingState>([{ id: "createdAt", desc: true }]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data, isLoading } = useWorkouts({ search: searchQuery, filters, sorting });
  const { mutate: deleteWorkout } = useDeleteWorkout();

  const workouts = data ?? [];
  const totalCount = workouts.length;

  const hasSearch = searchQuery !== "";

  const handleDelete = (id: string) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = () => {
    if (!deleteConfirm) return;
    deleteWorkout(deleteConfirm, {
      onSuccess: () => {
        toast.success("Workout deactivated");
        setDeleteConfirm(null);
      },
      onError: () => {
        toast.error("Failed to deactivate workout");
        setDeleteConfirm(null);
      },
    });
  };

  return (
    <div className="flex flex-col min-h-full bg-canvas">
      <div className="p-4 sm:p-6 lg:p-8 flex-1 w-full max-w-7xl mx-auto">
        {/* Page heading */}
        <div className="mb-6">
          <h1 className="text-h2 font-heading font-bold text-primary">Workouts</h1>
          <p className="text-sm text-muted mt-1">Create and manage workout plans for your members.</p>
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
        ) : viewMode === "table" ? (
          <WorkoutsTable
            data={workouts}
            onDelete={handleDelete}
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
              <WorkoutCard key={workout.id} workout={workout} index={i} />
            ))}
          </motion.div>
        )}
      </div>

      {/* Delete confirmation modal */}
      <ResponsiveModal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
      >
        <div className="p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold text-primary mb-2">Deactivate Workout?</h3>
          <p className="text-sm text-muted mb-6">
            This will deactivate the workout. Members assigned to it will no longer see it. You can reactivate it later.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Deactivate
            </Button>
          </div>
        </div>
      </ResponsiveModal>
    </div>
  );
}
