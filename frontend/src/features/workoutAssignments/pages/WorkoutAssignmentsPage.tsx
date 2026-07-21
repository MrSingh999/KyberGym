import { useState } from "react";
import { SortingState } from "@tanstack/react-table";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Plus, Search, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import { useAssignments, useRemoveAssignment } from "../hooks/useWorkoutAssignments";
import { useWorkoutAssignmentStore } from "../store/useWorkoutAssignmentStore";
import { AssignmentsTable } from "../components/AssignmentsTable";
import { EmptyAssignmentsState } from "../components/EmptyAssignmentsState";
import { AssignWorkoutModal } from "../components/AssignWorkoutModal";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export function WorkoutAssignmentsPage() {
  const { searchQuery, setSearchQuery, filters, setFilters } = useWorkoutAssignmentStore();
  const [sorting, setSorting] = useState<SortingState>([{ id: "assignedAt", desc: true }]);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [removeConfirm, setRemoveConfirm] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 50;

  const { data, isLoading } = useAssignments({ search: searchQuery, filters, sorting, page, limit });
  const { mutate: removeAssignment } = useRemoveAssignment();

  const paginated = data ?? { data: [], total: 0, page: 1, limit: 50, totalPages: 1 };
  const assignments = paginated.data;
  const totalCount = paginated.total;
  const totalPages = paginated.totalPages;
  const currentPage = paginated.page;
  const hasSearch = searchQuery !== "" || Object.keys(filters).length > 0;

  const confirmRemove = () => {
    if (!removeConfirm) return;
    removeAssignment(removeConfirm, {
      onSuccess: () => {
        toast.success("Assignment removed");
        setRemoveConfirm(null);
      },
      onError: () => {
        toast.error("Failed to remove assignment");
        setRemoveConfirm(null);
      },
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in">
        <div>
          <h1 className="font-bold text-xl sm:text-2xl text-text-primary tracking-tight">
            Workout <span className="text-text-secondary font-normal ml-0.5">Assignments</span>
          </h1>
          <p className="text-text-secondary mt-1 text-xs font-mono">
            Assign workout programs to gym members.
          </p>
        </div>
        <button
          onClick={() => setAssignModalOpen(true)}
          className="flex items-center space-x-2 bg-primary text-primary-foreground hover:opacity-90 px-4 py-2.5 sm:py-2 rounded-[6px] font-semibold text-sm transition-all duration-200 cursor-pointer border border-border-hover min-h-[44px] sm:min-h-0 w-full sm:w-auto justify-center sm:justify-start active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          <span>Assign Workout</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <div className="flex-1 w-full sm:max-w-sm">
          <div className="relative">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search by member or workout..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="w-full bg-surface border border-border-default rounded-[6px] pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-border-hover transition-all duration-200 font-mono"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={filters.status || "all"}
            onValueChange={(v) => { setFilters({ status: v === "all" ? undefined : v as any }); setPage(1); }}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="REMOVED">Removed</SelectItem>
            </SelectContent>
          </Select>

          <span className="text-sm text-text-muted tabular-nums whitespace-nowrap font-mono">
            {totalCount} assignment{totalCount !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-[16px] border border-default overflow-hidden bg-surface shadow-sm">
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        </div>
      ) : assignments.length === 0 ? (
        <EmptyAssignmentsState
          variant={hasSearch ? "no-search" : "no-assignments"}
          onAction={hasSearch ? undefined : () => setAssignModalOpen(true)}
        />
      ) : (
        <>
          <div className="hidden lg:block">
            <AssignmentsTable
              data={assignments}
              onRemove={setRemoveConfirm}
              sorting={sorting}
              onSortingChange={setSorting}
            />
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="p-2 rounded-lg border border-border-default hover:bg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono text-text-secondary px-3">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="p-2 rounded-lg border border-border-default hover:bg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}

      {assignments.length > 0 && (
        <div className="block lg:hidden">
          <motion.div className="grid grid-cols-1 gap-4">
            {assignments.map((a) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-surface border border-border-default rounded-[12px] p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-primary font-mono text-sm">{a.workoutTitle}</span>
                  {a.status === "ACTIVE" ? (
                    <span className="text-[10px] font-bold font-mono text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">Active</span>
                  ) : (
                    <span className="text-[10px] font-bold font-mono text-red-600 bg-red-500/10 px-2 py-0.5 rounded-full">Removed</span>
                  )}
                </div>
                <p className="text-xs text-text-secondary font-mono">{a.memberName}</p>
                <p className="text-xs text-text-muted font-mono">
                  {new Date(a.assignedAt).toLocaleDateString()}
                </p>
                {a.status === "ACTIVE" && (
                  <button
                    onClick={() => setRemoveConfirm(a.id)}
                    className="text-xs text-destructive hover:underline font-mono cursor-pointer"
                  >
                    Remove
                  </button>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}

      <AssignWorkoutModal open={assignModalOpen} onOpenChange={setAssignModalOpen} />

      <ResponsiveModal open={!!removeConfirm} onClose={() => setRemoveConfirm(null)}>
        <div className="p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold text-primary mb-2">Remove Assignment?</h3>
          <p className="text-sm text-muted mb-6">
            This will soft-remove the assignment. The member will no longer have access to this workout.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => setRemoveConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmRemove}>Remove</Button>
          </div>
        </div>
      </ResponsiveModal>
    </div>
  );
}
