import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Plus, Search, Building2, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { useSAGyms, useSACreateGym, useSASuspendGym, useSAActivateGym, useSADeleteGym } from "../hooks/useSuperAdmin";
import { SUBSCRIPTION_STATUS_LABELS } from "../types";
import { Button, LoadingButton } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/feedback/Skeleton";

export function SuperAdminGymsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ gymName: "", subdomain: "", ownerName: "", email: "", phone: "" });

  const { data, isLoading } = useSAGyms({ page, limit: 10, search: search || undefined, status: statusFilter || undefined });
  const { mutate: createGym, isPending: isCreating } = useSACreateGym();
  const { mutate: suspendGym } = useSASuspendGym();
  const { mutate: activateGym } = useSAActivateGym();
  const { mutate: deleteGym } = useSADeleteGym();

  const gyms = data?.data ?? [];
  const meta = data?.meta ?? { page: 1, limit: 10, total: 0, totalPages: 0 };

  const handleCreate = () => {
    createGym(createForm, {
      onSuccess: (result) => {
        toast.success(`Gym created! Temp password: ${result.temporaryPassword}`);
        setShowCreate(false);
        setCreateForm({ gymName: "", subdomain: "", ownerName: "", email: "", phone: "" });
      },
      onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to create gym"),
    });
  };

  const handleSuspend = (id: string) => {
    suspendGym(id, {
      onSuccess: () => toast.success("Gym suspended"),
      onError: () => toast.error("Failed to suspend gym"),
    });
  };

  const handleActivate = (id: string) => {
    activateGym(id, {
      onSuccess: () => toast.success("Gym activated"),
      onError: () => toast.error("Failed to activate gym"),
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this gym? This action cannot be undone.")) return;
    deleteGym(id, {
      onSuccess: () => toast.success("Gym deleted"),
      onError: () => toast.error("Failed to delete gym"),
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex-1 w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-h2 font-heading font-bold text-primary">Gyms</h1>
          <p className="text-sm text-muted mt-1">Manage all gyms on the platform.</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          Create Gym
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <Input
            placeholder="Search gyms..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="h-10 rounded-xl border border-default bg-surface px-3 text-sm text-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="trial">Trial</option>
          <option value="expired">Expired</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-default overflow-hidden bg-surface shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-default bg-surface-hover">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Gym</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Subdomain</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Subscription</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Created</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-default">
                    <td className="px-4 py-3"><Skeleton className="h-5 w-40" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-5 w-24" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-5 w-20" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-5 w-20" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-5 w-24" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-5 w-20" /></td>
                  </tr>
                ))
              ) : gyms.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted">
                    <Building2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p>No gyms found</p>
                  </td>
                </tr>
              ) : (
                gyms.map((gym) => (
                  <tr
                    key={gym.id}
                    onClick={() => navigate(`/super-admin/gyms/${gym.id}`)}
                    className="border-b border-default hover:bg-surface-hover transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3 font-medium text-primary">{gym.name}</td>
                    <td className="px-4 py-3 text-muted">{gym.subdomain || "-"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        gym.isActive ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
                      }`}>
                        {gym.isActive ? "Active" : "Suspended"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                        gym.subscriptionStatus === "active" ? "bg-emerald-500/10 text-emerald-600 border-emerald-200" :
                        gym.subscriptionStatus === "trial" ? "bg-amber-500/10 text-amber-600 border-amber-200" :
                        "bg-red-500/10 text-red-600 border-red-200"
                      }`}>
                        {SUBSCRIPTION_STATUS_LABELS[gym.subscriptionStatus] || gym.subscriptionStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted text-xs">
                      {new Date(gym.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        {gym.isActive ? (
                          <button onClick={() => handleSuspend(gym.id)} className="px-2 py-1 text-xs rounded-lg hover:bg-surface-hover text-amber-600">Suspend</button>
                        ) : (
                          <button onClick={() => handleActivate(gym.id)} className="px-2 py-1 text-xs rounded-lg hover:bg-surface-hover text-emerald-600">Activate</button>
                        )}
                        <button onClick={() => handleDelete(gym.id)} className="px-2 py-1 text-xs rounded-lg hover:bg-surface-hover text-red-600">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-default">
          <span className="text-sm text-muted">
            {meta.total} gym{(meta.total ?? 0) !== 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
              className="p-1.5 rounded-lg hover:bg-surface-hover disabled:opacity-30 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-muted tabular-nums">Page {page} of {meta.totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))} disabled={page >= meta.totalPages}
              className="p-1.5 rounded-lg hover:bg-surface-hover disabled:opacity-30 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Create Gym Modal */}
      <ResponsiveModal open={showCreate} onClose={() => setShowCreate(false)}>
        <div className="p-6 max-w-md">
          <h3 className="text-lg font-semibold text-primary mb-6">Create New Gym</h3>
          <div className="space-y-4">
            <div>
              <Label>Gym Name</Label>
              <Input value={createForm.gymName} onChange={(e) => setCreateForm({ ...createForm, gymName: e.target.value })} placeholder="e.g. Iron Paradise" />
            </div>
            <div>
              <Label>Subdomain</Label>
              <Input value={createForm.subdomain} onChange={(e) => setCreateForm({ ...createForm, subdomain: e.target.value })} placeholder="iron-paradise" />
            </div>
            <div>
              <Label>Owner Name</Label>
              <Input value={createForm.ownerName} onChange={(e) => setCreateForm({ ...createForm, ownerName: e.target.value })} placeholder="John Doe" />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} type="email" placeholder="john@example.com" />
            </div>
            <div>
              <Label>Phone (optional)</Label>
              <Input value={createForm.phone} onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })} placeholder="+1234567890" />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              <LoadingButton onClick={handleCreate} loading={isCreating}>Create Gym</LoadingButton>
            </div>
          </div>
        </div>
      </ResponsiveModal>
    </div>
  );
}
