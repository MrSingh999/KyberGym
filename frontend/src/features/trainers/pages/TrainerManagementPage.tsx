import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Search, UserPlus, UserCheck, XCircle } from "lucide-react";
import {
  useTrainers, useCreateTrainer, useUpdateTrainer,
  useDeactivateTrainer, useActivateTrainer, useAssignMembers,
  useRemoveMemberAssignment, useTrainerMembers,
} from "../hooks/useTrainers";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Skeleton } from "@/components/feedback/Skeleton";
import { EmptyState } from "@/components/feedback/EmptyState";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { CreateTrainerModal } from "../components/CreateTrainerModal";
import { AssignMembersModal } from "../components/AssignMembersModal";

export function TrainerManagementPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [assignTarget, setAssignTarget] = useState<string | null>(null);
  const [viewMembersTarget, setViewMembersTarget] = useState<string | null>(null);
  const [membersPage, setMembersPage] = useState(1);

  const { data, isLoading } = useTrainers({ search, status: statusFilter as any, page, limit: 20 });
  const { mutate: createTrainer, isPending: isCreating } = useCreateTrainer();
  const { mutate: updateTrainer } = useUpdateTrainer("");
  const { mutate: deactivate } = useDeactivateTrainer();
  const { mutate: activate } = useActivateTrainer();

  const trainers = data?.data ?? [];
  const meta = data as any;

  const { data: membersData } = useTrainerMembers(viewMembersTarget ?? "", { page: membersPage, limit: 20 });
  const { mutate: removeAssignment } = useRemoveMemberAssignment(viewMembersTarget ?? "");
  const [removeConfirm, setRemoveConfirm] = useState<string | null>(null);
  const [deactivateConfirm, setDeactivateConfirm] = useState<string | null>(null);

  const handleCreate = (formData: any) => {
    createTrainer(formData, {
      onSuccess: () => { toast.success("Trainer created"); setCreateOpen(false); },
      onError: (e: any) => toast.error(e?.response?.data?.message || "Failed to create trainer"),
    });
  };

  const confirmDeactivate = () => {
    if (!deactivateConfirm) return;
    deactivate(deactivateConfirm, {
      onSuccess: () => { toast.success("Trainer deactivated"); setDeactivateConfirm(null); },
      onError: (e: any) => toast.error(e?.response?.data?.message || "Failed"),
    });
  };

  const handleToggleStatus = (id: string, current: string) => {
    if (current === "ACTIVE") {
      setDeactivateConfirm(id);
    } else {
      activate(id, {
        onSuccess: () => toast.success("Trainer activated"),
        onError: (e: any) => toast.error(e?.response?.data?.message || "Failed"),
      });
    }
  };

  const confirmRemove = () => {
    if (!removeConfirm || !viewMembersTarget) return;
    removeAssignment(removeConfirm, {
      onSuccess: () => { toast.success("Assignment removed"); setRemoveConfirm(null); },
      onError: () => toast.error("Failed to remove assignment"),
    });
  };

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-[1600px] mx-auto animate-fade-slide-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="font-bold text-xl sm:text-2xl text-text-primary tracking-tight">Trainers</h1>
          <p className="text-text-secondary mt-1 text-xs">Manage gym trainers and member assignments.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="flex items-center gap-2 cursor-pointer">
          <UserPlus className="h-3.5 w-3.5" />
          <span>Add Trainer</span>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="search"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-border-default bg-surface text-sm text-text-primary placeholder:text-text-muted outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
        <div className="w-full sm:w-44">
          <Select value={statusFilter || "all"} onValueChange={(v) => { setStatusFilter(v === "all" ? "" : v); setPage(1); }}>
            <SelectTrigger>
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-xl border border-border-default bg-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-default bg-surface-hover/50">
                <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-4 py-3">Name</th>
                <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Email</th>
                <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-4 py-3 hidden md:table-cell">Specialization</th>
                <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-4 py-3">Members</th>
                <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-4 py-3">Status</th>
                <th className="text-right text-xs font-semibold text-text-muted uppercase tracking-wider px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border-default">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : trainers.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12"><EmptyState title="No trainers found" description="Add a trainer to get started." /></td></tr>
              ) : (
                trainers.map((t) => (
                  <tr key={t.id} className="border-b border-border-default last:border-0 hover:bg-surface-hover/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                          {t.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text-primary">{t.fullName}</p>
                          <p className="text-xs text-text-muted sm:hidden">{t.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary hidden sm:table-cell">{t.email}</td>
                    <td className="px-4 py-3 text-sm text-text-secondary hidden md:table-cell">{t.specialization || "—"}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => { setViewMembersTarget(t.id); setMembersPage(1); }}
                        className="text-sm text-primary hover:underline font-mono cursor-pointer"
                      >
                        {t.memberCount} member{t.memberCount !== 1 ? "s" : ""}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={t.status === "ACTIVE" ? "success" : "secondary"} className="font-mono text-[10px]">
                        {t.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setAssignTarget(t.id)}
                          className="p-2 rounded-lg text-text-muted hover:text-primary hover:bg-surface-hover transition-colors cursor-pointer"
                          title="Assign members"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(t.id, t.status)}
                          className={`p-2 rounded-lg transition-colors cursor-pointer ${
                            t.status === "ACTIVE"
                              ? "text-text-muted hover:text-amber-600 hover:bg-amber-500/10"
                              : "text-text-muted hover:text-emerald-600 hover:bg-emerald-500/10"
                          }`}
                          title={t.status === "ACTIVE" ? "Deactivate" : "Activate"}
                        >
                          {t.status === "ACTIVE" ? <XCircle className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border-default">
            <p className="text-sm text-text-muted">Page {meta.page} of {meta.totalPages} ({meta.total} total)</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
              <Button variant="outline" size="sm" disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </div>

      <CreateTrainerModal open={createOpen} onOpenChange={setCreateOpen} onSubmit={handleCreate} isPending={isCreating} />

      {assignTarget && (
        <AssignMembersModal
          open={!!assignTarget}
          onOpenChange={() => setAssignTarget(null)}
          trainerId={assignTarget}
        />
      )}

      <ResponsiveModal
        open={!!viewMembersTarget}
        onOpenChange={() => setViewMembersTarget(null)}
        title="Assigned Members"
        description="Members assigned to this trainer."
      >
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {membersData?.data?.length ? (
            membersData.data.map((a: any) => (
              <div key={a.id || a._id} className="flex items-center justify-between p-3 rounded-lg border border-border-default">
                <div>
                  <p className="text-sm font-mono text-text-primary">{a.memberId?.fullName}</p>
                  <p className="text-xs text-text-muted font-mono">{a.memberId?.email}</p>
                </div>
                <button
                  onClick={() => setRemoveConfirm(a.id || a._id)}
                  className="p-1.5 rounded-lg text-text-muted hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            ))
          ) : (
            <p className="text-xs text-text-muted text-center py-4 font-mono">No members assigned.</p>
          )}
        </div>
      </ResponsiveModal>

      <AlertDialog open={!!deactivateConfirm} onOpenChange={(o) => !o && setDeactivateConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Trainer</AlertDialogTitle>
            <AlertDialogDescription>
              This trainer will no longer be able to log in. Existing member assignments will remain unchanged.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeactivateConfirm(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeactivate} className="bg-destructive text-destructive-foreground hover:bg-destructive/80 cursor-pointer">Deactivate</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!removeConfirm} onOpenChange={(o) => !o && setRemoveConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Assignment</AlertDialogTitle>
            <AlertDialogDescription>Remove this member from the trainer's roster?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRemoveConfirm(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemove} className="bg-destructive text-destructive-foreground hover:bg-destructive/80 cursor-pointer">Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
