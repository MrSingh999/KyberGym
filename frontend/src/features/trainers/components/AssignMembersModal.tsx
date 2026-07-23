import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { Search, Loader2 } from "lucide-react";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/Checkbox";
import { apiClient } from "@/lib/apiClient";
import { useGymStore } from "@/store/gym.store";
import { useAssignMembers } from "../hooks/useTrainers";

interface MemberBrief {
  _id: string;
  fullName: string;
  email?: string;
  memberCode?: string;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => { const t = setTimeout(() => setDebounced(value), delay); return () => clearTimeout(t); }, [value, delay]);
  return debounced;
}

interface AssignMembersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trainerId: string;
}

export function AssignMembersModal({ open, onOpenChange, trainerId }: AssignMembersModalProps) {
  const { selectedGymId } = useGymStore();
  const { mutate: assign, isPending } = useAssignMembers(trainerId);
  const [members, setMembers] = useState<MemberBrief[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const debouncedSearch = useDebounce(search, 250);

  useEffect(() => {
    if (!open || !selectedGymId || !trainerId) return;
    setLoading(true);
    setSelected([]);
    setSearch("");

    Promise.all([
      apiClient.get("/members?limit=500&sort=fullName&order=asc"),
      apiClient.get(`/trainers/${trainerId}/members?limit=100`),
    ])
      .then(([membersRes, assignedRes]) => {
        const rawMembers = membersRes.data.data?.members || membersRes.data.data || membersRes.data;
        const allMembers: MemberBrief[] = Array.isArray(rawMembers)
          ? rawMembers.map((m: any) => ({ _id: m._id || m.id, fullName: m.fullName || m.name, email: m.email, memberCode: m.memberCode }))
          : [];

        const rawAssigned = assignedRes.data.data || [];
        const assignedIds = new Set(
          Array.isArray(rawAssigned) ? rawAssigned.map((a: any) => a.memberPublicId) : []
        );

        setMembers(allMembers.filter((m) => !assignedIds.has(m._id)));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, selectedGymId, trainerId]);

  const filtered = useMemo(() => {
    if (!debouncedSearch) return members;
    const q = debouncedSearch.toLowerCase();
    return members.filter((m) => m.fullName.toLowerCase().includes(q) || (m.memberCode && m.memberCode.toLowerCase().includes(q)));
  }, [members, debouncedSearch]);

  const toggleAll = () => {
    if (selected.length === filtered.length) {
      setSelected([]);
    } else {
      setSelected(filtered.map((m) => m._id));
    }
  };

  const toggleMember = (id: string) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const handleAssign = () => {
    if (selected.length === 0) { toast.error("Select at least one member"); return; }
    assign(selected, {
      onSuccess: (result) => {
        toast.success(`Assigned to ${result.assigned} member${result.assigned !== 1 ? "s" : ""}${result.skipped ? ` (${result.skipped} skipped)` : ""}`);
        onOpenChange(false);
      },
      onError: () => toast.error("Failed to assign members"),
    });
  };

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange} title="Assign Members" description="Select members to assign to this trainer.">
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search by name or member code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface border border-border-default rounded-[6px] pl-9 pr-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-border-hover font-mono"
          />
        </div>

        <div className="flex items-center justify-between text-xs text-text-muted font-mono px-1">
          <span>{selected.length} selected</span>
          <button onClick={toggleAll} className="text-primary hover:underline cursor-pointer">
            {selected.length === filtered.length ? "Clear all" : "Select all"}
          </button>
        </div>

        <div className="max-h-64 overflow-y-auto border border-border-default rounded-[6px] divide-y divide-border-default/50">
          {loading ? (
            <div className="flex items-center justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-text-muted" /></div>
          ) : filtered.length === 0 ? (
            <p className="text-xs text-text-muted font-mono text-center py-6">No members found</p>
          ) : (
            filtered.map((m) => (
              <label key={m._id} className="flex items-center gap-3 px-3 py-2.5 hover:bg-surface-hover transition-colors cursor-pointer">
                <Checkbox checked={selected.includes(m._id)} onCheckedChange={() => toggleMember(m._id)} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary font-mono truncate">{m.fullName}</p>
                  <p className="text-xs text-text-muted truncate">
                    {m.memberCode && <span className="font-mono">{m.memberCode} · </span>}
                    {m.email}
                  </p>
                </div>
              </label>
            ))
          )}
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleAssign} disabled={isPending || selected.length === 0}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />}
            Assign ({selected.length})
          </Button>
        </div>
      </div>
    </ResponsiveModal>
  );
}
