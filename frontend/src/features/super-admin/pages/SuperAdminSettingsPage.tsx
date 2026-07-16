import { useState, useMemo } from "react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { ColumnDef, PaginationState } from "@tanstack/react-table";
import { RotateCcw, Building2, ShieldAlert, Settings, Shield, Trash2 } from "lucide-react";
import { useSAGyms, useSARestoreGym, useSAPermanentDeleteGym } from "../hooks/useSuperAdmin";
import { GymTenantListItem } from "../types";
import { DataTable } from "@/components/data-display/DataTable";
import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/ui/responsive-modal";

export function SuperAdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<"general" | "gyms">("general");
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  
  // Safety confirmation states for permanent delete
  const [gymToDelete, setGymToDelete] = useState<GymTenantListItem | null>(null);
  const [confirmNameInput, setConfirmNameInput] = useState("");

  const page = pagination.pageIndex + 1;

  // Query only soft-deleted gyms
  const { data, isLoading, isError, refetch } = useSAGyms({
    page,
    limit: 10,
    status: "deleted",
  });

  const { mutate: restoreGym, isPending: isRestoring } = useSARestoreGym();
  const { mutate: permanentDeleteGym, isPending: isPermDeleting } = useSAPermanentDeleteGym();

  const deletedGyms = data?.data ?? [];
  const meta = data?.meta ?? { page: 1, limit: 10, total: 0, totalPages: 0 };

  const handleRestore = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to restore the gym "${name}"?`)) return;
    restoreGym(id, {
      onSuccess: () => {
        toast.success(`Gym "${name}" has been successfully restored!`);
        refetch();
      },
      onError: (err: any) => {
        const errorMsg = err?.response?.data?.message || "Failed to restore gym";
        toast.error(errorMsg);
      },
    });
  };

  const handleConfirmPermanentDelete = () => {
    if (!gymToDelete) return;
    permanentDeleteGym(gymToDelete.id, {
      onSuccess: () => {
        toast.success(`Gym "${gymToDelete.name}" has been permanently deleted.`);
        setGymToDelete(null);
        setConfirmNameInput("");
        refetch();
      },
      onError: (err: any) => {
        const errorMsg = err?.response?.data?.message || "Failed to permanently delete gym";
        toast.error(errorMsg);
      },
    });
  };

  const columns = useMemo<ColumnDef<GymTenantListItem>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Gym Name",
        cell: ({ row }) => (
          <span className="font-semibold text-text-primary">
            {row.original.name}
          </span>
        ),
      },
      {
        accessorKey: "subdomain",
        header: "Deleted Subdomain",
        cell: ({ row }) => (
          <span className="text-text-muted text-xs font-mono">
            {row.original.subdomain || "-"}
          </span>
        ),
      },
      {
        accessorKey: "deletedAt",
        header: "Deleted Date",
        cell: ({ row }) => (
          <span className="text-text-muted text-xs font-mono">
            {row.original.deletedAt
              ? format(parseISO(row.original.deletedAt), "MMM d, yyyy h:mm a")
              : "N/A"}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Button
              onClick={() => handleRestore(row.original.id, row.original.name)}
              size="sm"
              variant="outline"
              className="flex items-center gap-1.5 h-8 text-xs border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40 active:scale-95 transition-all cursor-pointer"
              disabled={isRestoring || isPermDeleting}
            >
              <RotateCcw className="size-3.5" />
              <span>Restore</span>
            </Button>
            <Button
              onClick={() => setGymToDelete(row.original)}
              size="sm"
              variant="destructive"
              className="flex items-center gap-1.5 h-8 text-xs active:scale-95 transition-all cursor-pointer"
              disabled={isRestoring || isPermDeleting}
            >
              <Trash2 className="size-3.5" />
              <span>Delete Permanently</span>
            </Button>
          </div>
        ),
      },
    ],
    [isRestoring, isPermDeleting]
  );

  return (
    <div className="flex-1 w-full max-w-[1600px] mx-auto animate-fade-slide-up">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-bold text-xl sm:text-2xl text-text-primary tracking-tight">
          System <span className="text-text-secondary font-normal ml-0.5">Settings</span>
        </h1>
        <p className="text-text-secondary mt-1 text-xs font-mono">
          Configure platform options and manage system recovery.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Navigation Sidebar: Horizontal Scroll on Mobile/Tablet, Vertical Sidebar on Desktop */}
        <div className="w-full lg:w-64 shrink-0 flex flex-row lg:flex-col gap-1.5 border-b lg:border-b-0 lg:border-r border-border-default pb-4 lg:pb-0 lg:pr-4 overflow-x-auto whitespace-nowrap scrollbar-none">
          <button
            onClick={() => setActiveTab("general")}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer shrink-0 ${
              activeTab === "general"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
            }`}
          >
            <Settings className="size-4" />
            <span>General Settings</span>
          </button>
          <button
            onClick={() => setActiveTab("gyms")}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer shrink-0 ${
              activeTab === "gyms"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
            }`}
          >
            <Building2 className="size-4" />
            <span>Gym Management</span>
          </button>
        </div>

        {/* Settings View Panel */}
        <div className="flex-1 min-w-0">
          {activeTab === "general" ? (
            <div className="glass-panel p-6 rounded-2xl border border-border-default space-y-6">
              <div>
                <h2 className="text-base font-bold text-text-primary">General Platform Settings</h2>
                <p className="text-xs text-text-secondary mt-0.5">Configure platform branding, metadata, and default features.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-primary">System Name</label>
                  <input
                    type="text"
                    disabled
                    value="KyberGym SaaS"
                    className="w-full h-9 rounded-lg border border-border-default bg-canvas/50 px-3 text-sm text-text-secondary disabled:cursor-not-allowed opacity-80"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-primary">Default Timezone</label>
                  <input
                    type="text"
                    disabled
                    value="Asia/Kolkata (GMT+5:30)"
                    className="w-full h-9 rounded-lg border border-border-default bg-canvas/50 px-3 text-sm text-text-secondary disabled:cursor-not-allowed opacity-80"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-border-default bg-surface-hover/30 p-4 flex gap-3 text-xs text-text-secondary leading-relaxed">
                <Shield className="size-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-text-primary block">Super Admin Mode</span>
                  You are editing system-wide configurations. Some configuration fields are set via environment files (.env) for deployment security and are read-only here.
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Gym management settings overview */}
              <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-border-default space-y-6">
                <div>
                  <h2 className="text-base font-bold text-text-primary">Restore & Manage Deleted Gyms</h2>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Recover soft-deleted tenant accounts or permanently purge them along with all related users and statistics.
                  </p>
                </div>

                {isError ? (
                  <div className="flex flex-col items-center justify-center p-8 border border-border-default rounded-xl bg-surface gap-3 text-center">
                    <ShieldAlert className="size-10 text-destructive" />
                    <div>
                      <p className="text-sm font-semibold text-text-primary">Failed to load deleted gyms</p>
                      <p className="text-xs text-text-secondary mt-0.5">Please check backend database connection.</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Desktop View: Table Layout */}
                    <div className="hidden lg:block">
                      <DataTable
                        columns={columns}
                        data={deletedGyms}
                        pageCount={meta.totalPages}
                        pagination={pagination}
                        onPaginationChange={setPagination}
                        isLoading={isLoading}
                      />
                    </div>

                    {/* Mobile/Tablet View: Card List Grid Layout */}
                    <div className="block lg:hidden">
                      {isLoading ? (
                        <div className="flex justify-center py-10">
                          <div className="h-8 w-8 animate-spin rounded-full border-4 border-default border-t-primary"></div>
                        </div>
                      ) : deletedGyms.length ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {deletedGyms.map((gym) => (
                            <div
                              key={gym.id}
                              className="flex flex-col p-4 rounded-xl border border-border-default bg-surface gap-4 shadow-sm"
                            >
                              <div className="flex items-start justify-between min-w-0">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-10 h-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
                                    <Building2 className="w-5 h-5" />
                                  </div>
                                  <div className="min-w-0">
                                    <h3 className="text-sm font-semibold text-text-primary truncate">
                                      {gym.name}
                                    </h3>
                                    <span className="text-[10px] text-text-muted font-mono mt-0.5 block">
                                      {gym.subdomain || "-"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-[11px] text-text-muted font-mono leading-none">
                                Deleted: {gym.deletedAt ? format(parseISO(gym.deletedAt), "MMM d, yyyy h:mm a") : "N/A"}
                              </div>
                              <div className="flex gap-2 pt-3 border-t border-border-default/40">
                                <Button
                                  onClick={() => handleRestore(gym.id, gym.name)}
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 text-xs h-9 cursor-pointer"
                                  disabled={isRestoring || isPermDeleting}
                                >
                                  <RotateCcw className="size-3.5 mr-1" />
                                  Restore
                                </Button>
                                <Button
                                  onClick={() => setGymToDelete(gym)}
                                  size="sm"
                                  variant="destructive"
                                  className="flex-1 text-xs h-9 cursor-pointer"
                                  disabled={isRestoring || isPermDeleting}
                                >
                                  <Trash2 className="size-3.5 mr-1" />
                                  Purge
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-12 text-center border border-dashed border-border-default rounded-xl bg-surface-hover/10">
                          <p className="text-text-muted text-xs font-mono uppercase tracking-wider">
                            No deleted gyms found.
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Safety Confirmation Modal for Permanent Delete */}
      <ResponsiveModal
        open={!!gymToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setGymToDelete(null);
            setConfirmNameInput("");
          }
        }}
        title="Confirm Permanent Deletion"
        description="This action is extremely sensitive and irreversible."
      >
        <div className="p-6 space-y-5">
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 flex gap-3 text-xs text-destructive leading-relaxed">
            <ShieldAlert className="size-5 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-1">WARNING: CASCADING PURGE</span>
              You are about to permanently purge the gym <strong className="text-text-primary">{gymToDelete?.name}</strong>.
              This will permanently delete the gym database record, its subdomain reservation, its administrator user account, and all associated member profiles, workouts, attendance files, and payment histories.
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-primary block">
              To confirm deletion, please type <span className="font-mono bg-surface-hover px-1.5 py-0.5 rounded font-bold select-all">{gymToDelete?.name}</span> below:
            </label>
            <input
              type="text"
              value={confirmNameInput}
              onChange={(e) => setConfirmNameInput(e.target.value)}
              placeholder="Type gym name exactly"
              className="w-full h-10 rounded-xl border border-border-default bg-canvas px-3.5 text-sm text-text-primary focus:border-destructive focus:ring-1 focus:ring-destructive focus:outline-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border-default/40 justify-end w-full">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setGymToDelete(null);
                setConfirmNameInput("");
              }}
              className="w-full sm:w-auto text-xs h-9 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmPermanentDelete}
              className="w-full sm:w-auto text-xs h-9 cursor-pointer"
              disabled={confirmNameInput !== gymToDelete?.name || isPermDeleting}
            >
              {isPermDeleting ? "Purging..." : "Permanently Purge"}
            </Button>
          </div>
        </div>
      </ResponsiveModal>
    </div>
  );
}
