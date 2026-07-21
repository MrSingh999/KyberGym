import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, useRef, useMemo } from "react";
import { toast } from "sonner";
import { Loader2, Search } from "lucide-react";
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

export function AssignWorkoutModal({ open, onOpenChange }: AssignWorkoutModalProps) {
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
    },
  });

  const assignmentType = watch("assignmentType");
  const selectedIds = watch("memberIds") ?? [];

  useEffect(() => {
    if (open) {
      reset({ assignmentType: "SELECTED", memberIds: [], workoutId: "", startDate: undefined, endDate: undefined });
      setMemberSearch("");
    }
  }, [open, reset]);

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

  const filteredMembers = useMemo(() => {
    if (!debouncedSearch) return members;
    const q = debouncedSearch.toLowerCase();
    return members.filter(
      (m) =>
        m.fullName.toLowerCase().includes(q) ||
        (m.memberCode && m.memberCode.toLowerCase().includes(q))
    );
  }, [members, debouncedSearch]);

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
    <ResponsiveModal open={open} onOpenChange={onOpenChange} title="Assign Workout" description="Select a workout and assign it to members.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-2">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-secondary font-mono">Workout</label>
          <select
            {...register("workoutId")}
            className="w-full bg-surface border border-border-default rounded-[6px] px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-border-hover font-mono"
          >
            <option value="">Select a workout...</option>
            {(workouts ?? []).map((w) => (
              <option key={w.id} value={w.id}>{w.title}</option>
            ))}
          </select>
          {errors.workoutId && <p className="text-xs text-destructive font-mono">{errors.workoutId.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-secondary font-mono">Assignment Type</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setValue("assignmentType", "SELECTED", { shouldValidate: true })}
              className={`flex-1 px-3 py-2.5 rounded-[6px] text-sm font-mono border transition-all cursor-pointer ${
                assignmentType === "SELECTED"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-surface text-text-secondary border-border-default hover:border-border-hover"
              }`}
            >
              Select Members
            </button>
            <button
              type="button"
              onClick={() => setValue("assignmentType", "ALL", { shouldValidate: true })}
              className={`flex-1 px-3 py-2.5 rounded-[6px] text-sm font-mono border transition-all cursor-pointer ${
                assignmentType === "ALL"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-surface text-text-secondary border-border-default hover:border-border-hover"
              }`}
            >
              All Members
            </button>
          </div>
        </div>

        {assignmentType === "SELECTED" && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary font-mono">Members ({selectedIds.length} selected)</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search by name or member code..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className="w-full bg-surface border border-border-default rounded-[6px] pl-9 pr-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-border-hover font-mono"
              />
            </div>
            <div className="max-h-48 overflow-y-auto border border-border-default rounded-[6px] divide-y divide-border-default/50">
              {membersLoading ? (
                <div className="flex items-center justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-text-muted" /></div>
              ) : filteredMembers.length === 0 ? (
                <p className="text-xs text-text-muted font-mono text-center py-6">No members found</p>
              ) : (
                filteredMembers.map((m) => (
                  <label
                    key={m._id}
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-surface-hover transition-colors cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedIds.includes(m._id)}
                      onCheckedChange={() => toggleMember(m._id)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text-primary font-mono truncate">{m.fullName}</p>
                      <p className="text-xs text-text-muted truncate">
                        {m.memberCode && <span className="font-mono">{m.memberCode}</span>}
                        {m.memberCode && m.email && <span> &middot; </span>}
                        {m.email}
                      </p>
                    </div>
                  </label>
                ))
              )}
            </div>
            {errors.memberIds && <p className="text-xs text-destructive font-mono">{errors.memberIds.message}</p>}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary font-mono">Start Date</label>
            <input
              type="date"
              {...register("startDate")}
              className="w-full bg-surface border border-border-default rounded-[6px] px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-border-hover font-mono"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary font-mono">End Date</label>
            <input
              type="date"
              {...register("endDate")}
              className="w-full bg-surface border border-border-default rounded-[6px] px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-border-hover font-mono"
            />
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />}
            Assign
          </Button>
        </div>
      </form>
    </ResponsiveModal>
  );
}
