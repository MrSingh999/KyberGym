import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Search, FileText, Plus, Archive, ExternalLink } from "lucide-react";
import { useMyPlans, useArchivePlan } from "../hooks/useMemberWorkoutPlans";
import { useMyMembers } from "@/features/trainers/hooks/useTrainers";
import { useCreateMemberWorkoutPlan } from "../hooks/useMemberWorkoutPlans";
import { useWorkouts } from "@/features/workouts/hooks/useWorkouts";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/feedback/Skeleton";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { toast } from "sonner";

export function TrainerWorkoutPlansPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState("");
  const [templateOrScratch, setTemplateOrScratch] = useState<"template" | "scratch">("scratch");
  const [selectedTemplate, setSelectedTemplate] = useState("");

  const { data, isLoading } = useMyPlans({ search, status: statusFilter as any, page, limit: 20 });
  const { mutate: archivePlan } = useArchivePlan();
  const { mutate: createPlan, isPending: isCreating } = useCreateMemberWorkoutPlan();
  const { data: membersData } = useMyMembers({ page: 1, limit: 200 });
  const { data: templatesData } = useWorkouts({ status: "ACTIVE", page: 1, limit: 200 });

  const plans = data?.data ?? [];
  const meta = data as any;
  const members = (membersData as any)?.data ?? [];
  const templates = templatesData?.data ?? [];

  const handleCreate = () => {
    if (!selectedMember) { toast.error("Select a member"); return; }
    if (templateOrScratch === "template" && !selectedTemplate) { toast.error("Select a template"); return; }

    createPlan({
      memberId: selectedMember,
      trainerId: "", // backend resolves from auth
      sourceWorkoutId: templateOrScratch === "template" ? selectedTemplate : null,
    }, {
      onSuccess: (res) => {
        const newId = res._id || res.id;
        toast.success("Workout plan created");
        setCreateOpen(false);
        navigate(`/trainer/workout-plans/${newId}/edit`);
      },
      onError: (e: any) => toast.error(e?.response?.data?.message || "Failed to create plan"),
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="animate-fade-in">
          <h1 className="font-bold text-xl sm:text-2xl text-text-primary tracking-tight">My Workout Plans</h1>
          <p className="text-text-secondary mt-1 text-xs">Personalized workout plans for your assigned members.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="flex items-center gap-2 cursor-pointer">
          <Plus className="h-3.5 w-3.5" />
          <span>Create Plan</span>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
          <input
            type="search"
            placeholder="Search by workout name..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-border-default bg-surface text-sm text-text-primary placeholder:text-text-muted outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
        <div className="w-full sm:w-44">
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger><SelectValue placeholder="All Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value=" ">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-surface border border-border-default rounded-[12px] p-4 space-y-3">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      ) : plans.length === 0 ? (
        <EmptyState title="No workout plans yet" description="Create a personalized workout plan for one of your assigned members." />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map((p: any, i: number) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-surface border border-border-default rounded-[12px] p-4 space-y-3 hover:border-border-hover transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-text-primary truncate font-mono">{p.title}</p>
                    <p className="text-xs text-text-muted font-mono mt-0.5 truncate">{p.memberName || "Member"}</p>
                  </div>
                  <Badge variant={p.status === "ACTIVE" ? "success" : "secondary"} className="text-[9px] shrink-0">
                    {p.status}
                  </Badge>
                </div>

                <div className="flex items-center gap-3 text-xs text-text-muted font-mono">
                  {p.goal && <span>{p.goal}</span>}
                  {p.estimatedDuration && <span>· {p.estimatedDuration}min</span>}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-text-muted font-mono">
                    Updated {new Date(p.updatedAt).toLocaleDateString()}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => navigate(`/trainer/workout-plans/${p.id}/edit`)}
                      className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-surface-hover transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </button>
                    {p.status === "ACTIVE" && (
                      <button
                        onClick={() => {
                          archivePlan(p.id, {
                            onSuccess: () => toast.success("Plan archived"),
                            onError: () => toast.error("Failed to archive plan"),
                          });
                        }}
                        className="p-1.5 rounded-lg text-text-muted hover:text-amber-600 hover:bg-amber-500/10 transition-colors cursor-pointer"
                        title="Archive"
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
              <span className="text-xs font-mono text-text-secondary px-2">Page {meta.page} of {meta.totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          )}
        </>
      )}

      <ResponsiveModal open={createOpen} onOpenChange={setCreateOpen} title="Create Workout Plan" description="Choose a member and template to get started.">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-text-muted uppercase tracking-wider">Member</label>
            <Select value={selectedMember} onValueChange={setSelectedMember}>
              <SelectTrigger><SelectValue placeholder="Select member..." /></SelectTrigger>
              <SelectContent>
                {members.map((m: any) => (
                  <SelectItem key={m.memberId?._id || m._id} value={m.memberId?._id || m._id}>
                    {m.memberId?.fullName || m.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-text-muted uppercase tracking-wider">Start From</label>
            <div className="flex gap-2">
              <button
                onClick={() => { setTemplateOrScratch("scratch"); setSelectedTemplate(""); }}
                className={`flex-1 p-3 rounded-lg border text-sm font-mono transition-colors cursor-pointer ${
                  templateOrScratch === "scratch" ? "border-primary bg-primary/5 text-primary" : "border-border-default text-text-muted hover:border-border-hover"
                }`}
              >
                From Scratch
              </button>
              <button
                onClick={() => setTemplateOrScratch("template")}
                className={`flex-1 p-3 rounded-lg border text-sm font-mono transition-colors cursor-pointer ${
                  templateOrScratch === "template" ? "border-primary bg-primary/5 text-primary" : "border-border-default text-text-muted hover:border-border-hover"
                }`}
              >
                From Template
              </button>
            </div>
          </div>

          {templateOrScratch === "template" && (
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-text-muted uppercase tracking-wider">Workout Template</label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger><SelectValue placeholder="Select template..." /></SelectTrigger>
                <SelectContent>
                  {templates.map((t: any) => (
                    <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={isCreating || !selectedMember}>
              {isCreating ? "Creating..." : "Create"}
            </Button>
          </div>
        </div>
      </ResponsiveModal>
    </div>
  );
}
