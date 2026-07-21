import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { Loader2, Search, Calendar, Users, CheckCircle2 } from "lucide-react";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/apiClient";
import { useGymStore } from "@/store/gym.store";
import { assignWorkoutSchema, AssignWorkoutData } from "../schemas/workoutAssignment.schema";
import { useAssignWorkout } from "../hooks/useWorkoutAssignments";
import { useWorkouts as useWorkoutsList } from "../../workouts/hooks/useWorkouts";
import { Checkbox } from "@/components/ui/Checkbox";

interface AssignWorkoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialWorkoutId?: string;
}

interface MemberBrief {
  _id: string;
  fullName: string;
  email?: string;
  memberCode?: string;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export function AssignWorkoutModal({ open, onOpenChange, initialWorkoutId }: AssignWorkoutModalProps) {
  const { selectedGymId } = useGymStore();
  const { data: workouts } = useWorkoutsList();
  const { mutate: assign, isPending } = useAssignWorkout();
  const [members, setMembers] = useState<MemberBrief[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");

  const debouncedSearch = useDebounce(memberSearch, 250);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AssignWorkoutData>({
    resolver: zodResolver(assignWorkoutSchema),
    defaultValues: {
      assignmentType: "SELECTED",
      memberIds: [],
      workoutId: initialWorkoutId || "",
    },
  });

  const assignmentType = watch("assignmentType");
  const selectedIds = watch("memberIds") ?? [];
  const selectedWorkoutId = watch("workoutId");

  useEffect(() => {
    if (open) {
      reset({
        assignmentType: "SELECTED",
        memberIds: [],
        workoutId: initialWorkoutId || "",
        startDate: undefined,
        endDate: undefined,
      });
      setMemberSearch("");
    }
  }, [open, reset, initialWorkoutId]);

  useEffect(() => {
    if (!open || !selectedGymId) return;
    setMembersLoading(true);
    apiClient.get(`/members?limit=500&sort=fullName&order=asc`)
      .then((res) => {
        const raw = res.data.data?.members || res.data.data || res.data;
        setMembers(Array.isArray(raw) ? raw.map((m: any) => ({
          _id: m._id || m.id,
          fullName: m.fullName || m.name,
          email: m.email,
          memberCode: m.memberCode,
        })) : []);
      })
      .catch(() => {})
      .finally(() => setMembersLoading(false));
  }, [open, selectedGymId]);

  const toggleMember = (id: string) => {
    const current = selectedIds;
    const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
    setValue("memberIds", next, { shouldValidate: true });
  };

  const handleSelectAll = () => {
    const allFilteredIds = filteredMembers.map((m) => m._id);
    setValue("memberIds", Array.from(new Set([...selectedIds, ...allFilteredIds])), { shouldValidate: true });
  };

  const handleClearAll = () => {
    setValue("memberIds", [], { shouldValidate: true });
  };

  const applyDurationPreset = (months: number) => {
    const today = new Date();
    const startDateStr = today.toISOString().split("T")[0];
    
    const endDate = new Date(today);
    endDate.setMonth(endDate.getMonth() + months);
    const endDateStr = endDate.toISOString().split("T")[0];

    setValue("startDate", startDateStr as any, { shouldValidate: true });
    setValue("endDate", endDateStr as any, { shouldValidate: true });
  };

  const filteredMembers = useMemo(() => {
    if (!debouncedSearch) return members;
    const q = debouncedSearch.toLowerCase();
    return members.filter(
      (m) =>
        m.fullName.toLowerCase().includes(q) ||
        (m.memberCode && m.memberCode.toLowerCase().includes(q))
    );
  }, [members, debouncedSearch]);

  const selectedWorkout = useMemo(() => {
    return (workouts ?? []).find((w) => w.id === selectedWorkoutId);
  }, [workouts, selectedWorkoutId]);

  const onSubmit = (data: AssignWorkoutData) => {
    assign(data, {
      onSuccess: (result) => {
        const parts = [`Assigned to ${result.assigned} member${result.assigned !== 1 ? "s" : ""}`];
        if (result.skipped) parts.push(`${result.skipped} skipped`);
        toast.success(parts.join(", "));
        onOpenChange(false);
      },
      onError: () => {
        toast.error("Failed to assign workout");
      },
    });
  };

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange} title="Assign Workout Program" description="Select a workout template and assign it to members.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-2">
        
        {/* Workout Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-secondary font-mono">Workout Template</label>
          <select
            {...register("workoutId")}
            className="w-full bg-surface border border-border-default rounded-[6px] px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-border-hover font-mono"
          >
            <option value="">Select a workout template...</option>
            {(workouts ?? []).map((w) => (
              <option key={w.id} value={w.id}>{w.title} ({w.category || "General"} • {w.daysCount} days)</option>
            ))}
          </select>
          {errors.workoutId && <p className="text-xs text-destructive font-mono">{errors.workoutId.message}</p>}
          
          {selectedWorkout && (
            <div className="flex items-center gap-2 p-2.5 rounded-[8px] bg-primary/5 border border-primary/20 text-xs font-mono text-text-secondary">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
              <span>
                Selected: <strong className="text-text-primary">{selectedWorkout.title}</strong> ({selectedWorkout.daysCount} Days)
              </span>
            </div>
          )}
        </div>

        {/* Assignment Type Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-secondary font-mono">Assign Target</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setValue("assignmentType", "SELECTED", { shouldValidate: true })}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-[6px] text-xs font-semibold font-mono border transition-all cursor-pointer ${
                assignmentType === "SELECTED"
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-surface text-text-secondary border-border-default hover:border-border-hover"
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Select Members</span>
            </button>
            <button
              type="button"
              onClick={() => setValue("assignmentType", "ALL", { shouldValidate: true })}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-[6px] text-xs font-semibold font-mono border transition-all cursor-pointer ${
                assignmentType === "ALL"
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-surface text-text-secondary border-border-default hover:border-border-hover"
              }`}
            >
              <Users className="h-4 w-4 text-amber-400" />
              <span>All Active Members ({members.length})</span>
            </button>
          </div>
        </div>

        {/* Member Selector */}
        {assignmentType === "SELECTED" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-text-secondary font-mono">
                Select Members ({selectedIds.length} chosen)
              </label>
              <div className="flex items-center gap-2 text-xs font-mono">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-primary hover:underline cursor-pointer"
                >
                  Select All
                </button>
                <span className="text-text-muted">&bull;</span>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-text-muted hover:text-text-primary hover:underline cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search by member name or code..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className="w-full bg-surface border border-border-default rounded-[6px] pl-9 pr-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-border-hover font-mono"
              />
            </div>

            <div className="max-h-36 sm:max-h-44 overflow-y-auto border border-border-default rounded-[8px] divide-y divide-border-default/50 bg-surface">
              {membersLoading ? (
                <div className="flex items-center justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-text-muted" /></div>
              ) : filteredMembers.length === 0 ? (
                <p className="text-xs text-text-muted font-mono text-center py-6">No matching members found</p>
              ) : (
                filteredMembers.map((m) => {
                  const isChecked = selectedIds.includes(m._id);
                  return (
                    <label
                      key={m._id}
                      className={`flex items-center gap-3 px-3 py-2 hover:bg-surface-hover transition-colors cursor-pointer ${isChecked ? "bg-primary/5" : ""}`}
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => toggleMember(m._id)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-text-primary font-mono font-medium truncate">{m.fullName}</p>
                        <p className="text-[10px] text-text-muted truncate font-mono">
                          {m.memberCode && <span>{m.memberCode}</span>}
                          {m.memberCode && m.email && <span> &middot; </span>}
                          {m.email}
                        </p>
                      </div>
                    </label>
                  );
                })
              )}
            </div>
            {errors.memberIds && <p className="text-xs text-destructive font-mono">{errors.memberIds.message}</p>}
          </div>
        )}

        {/* Duration & Dates Presets */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-text-secondary font-mono">Schedule Duration</label>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => applyDurationPreset(1)}
                className="px-2 py-1 rounded text-[10px] font-mono font-semibold bg-surface border border-border-default hover:border-primary hover:text-primary transition-colors cursor-pointer"
              >
                +1 Month
              </button>
              <button
                type="button"
                onClick={() => applyDurationPreset(3)}
                className="px-2 py-1 rounded text-[10px] font-mono font-semibold bg-surface border border-border-default hover:border-primary hover:text-primary transition-colors cursor-pointer"
              >
                +3 Months
              </button>
              <button
                type="button"
                onClick={() => applyDurationPreset(6)}
                className="px-2 py-1 rounded text-[10px] font-mono font-semibold bg-surface border border-border-default hover:border-primary hover:text-primary transition-colors cursor-pointer"
              >
                +6 Months
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-text-muted font-mono">Start Date</label>
              <input
                type="date"
                {...register("startDate")}
                className="w-full bg-surface border border-border-default rounded-[6px] px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-border-hover font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-text-muted font-mono">End Date</label>
              <input
                type="date"
                {...register("endDate")}
                className="w-full bg-surface border border-border-default rounded-[6px] px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-border-hover font-mono"
              />
            </div>
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="flex gap-3 justify-end pt-3 border-t border-border-default">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" disabled={isPending} className="cursor-pointer">
            {isPending && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />}
            Confirm Assignment
          </Button>
        </div>
      </form>
    </ResponsiveModal>
  );
}
