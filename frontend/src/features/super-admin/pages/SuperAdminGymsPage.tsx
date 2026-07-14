import { format, parseISO } from "date-fns";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { ColumnDef, PaginationState, SortingState, RowSelectionState } from "@tanstack/react-table";
import { Plus, Search, CheckCircle2, Copy, ExternalLink } from "lucide-react";
import { useSAGyms, useSASuspendGym, useSAActivateGym, useSADeleteGym } from "../hooks/useSuperAdmin";
import { GymTenantListItem, SUBSCRIPTION_STATUS_LABELS } from "../types";
import { DataTable } from "@/components/data-display/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Badge } from "@/components/ui/badge";
import { ErrorState } from "@/components/feedback/ErrorState";
import { CreateGymForm } from "../components/CreateGymForm";

const statusVariant: Record<string, "success" | "warning" | "destructive" | "secondary"> = {
  active: "success",
  trial: "warning",
  expired: "destructive",
  suspended: "secondary",
};

export function SuperAdminGymsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [showCreate, setShowCreate] = useState(false);
  const [createdGymInfo, setCreatedGymInfo] = useState<{
    name: string;
    subdomain: string;
    email: string;
    temporaryPassword: string;
  } | null>(null);

  const page = pagination.pageIndex + 1;

  const { data, isLoading, isError, error, refetch } = useSAGyms({
    page,
    limit: 10,
    search: search || undefined,
    status: statusFilter || undefined,
  });

  const { mutate: suspendGym } = useSASuspendGym();
  const { mutate: activateGym } = useSAActivateGym();
  const { mutate: deleteGym } = useSADeleteGym();

  const gyms = data?.data ?? [];
  const meta = data?.meta ?? { page: 1, limit: 10, total: 0, totalPages: 0 };

  const columns = useMemo<ColumnDef<GymTenantListItem>[]>(
    () => {
      const handleSuspend = (id: string, name: string) => {
        suspendGym(id, {
          onSuccess: () => toast.success(`${name} suspended`),
          onError: () => toast.error("Failed to suspend gym"),
        });
      };
      const handleActivate = (id: string, name: string) => {
        activateGym(id, {
          onSuccess: () => toast.success(`${name} activated`),
          onError: () => toast.error("Failed to activate gym"),
        });
      };
      const handleDelete = (id: string, name: string) => {
        if (!confirm(`Delete "${name}"? This action cannot be undone.`)) return;
        deleteGym(id, {
          onSuccess: () => toast.success(`${name} deleted`),
          onError: () => toast.error("Failed to delete gym"),
        });
      };

      return [
      {
        accessorKey: "name",
        header: "Gym",
        cell: ({ row }) => (
          <span className="font-semibold text-text-primary hover:text-primary transition-colors">
            {row.original.name}
          </span>
        ),
      },
      {
        accessorKey: "subdomain",
        header: "Subdomain",
        cell: ({ row }) => (
          <span className="text-text-muted text-xs font-mono">
            {row.original.subdomain || "-"}
          </span>
        ),
        meta: { className: "hidden md:table-cell" },
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => (
          <Badge
            variant={row.original.isActive ? "success" : "secondary"}
            className="text-[10px]"
          >
            {row.original.isActive ? "Active" : "Suspended"}
          </Badge>
        ),
      },
      {
        accessorKey: "subscriptionStatus",
        header: "Subscription",
        cell: ({ row }) => (
          <Badge
            variant={statusVariant[row.original.subscriptionStatus] || "secondary"}
            className="text-[10px]"
          >
            {SUBSCRIPTION_STATUS_LABELS[row.original.subscriptionStatus] || row.original.subscriptionStatus}
          </Badge>
        ),
        meta: { className: "hidden sm:table-cell" },
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => (
          <span className="text-text-muted text-xs font-mono">
            {format(parseISO(row.original.createdAt), "MMM d, yyyy")}
          </span>
        ),
        meta: { className: "hidden md:table-cell" },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const gym = row.original;
          return (
            <div className="flex items-center gap-2">
              {gym.isActive ? (
                <button
                  onClick={(e) => { e.stopPropagation(); handleSuspend(gym.id, gym.name); }}
                  className="px-2 py-1 text-[10px] font-bold font-mono uppercase tracking-wider rounded-[4px] border border-border-default hover:border-amber-500/30 text-text-secondary hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-500/5 dark:hover:bg-amber-500/10 active:scale-95 transition-all duration-100 cursor-pointer"
                >
                  Suspend
                </button>
              ) : (
                <button
                  onClick={(e) => { e.stopPropagation(); handleActivate(gym.id, gym.name); }}
                  className="px-2 py-1 text-[10px] font-bold font-mono uppercase tracking-wider rounded-[4px] border border-border-default hover:border-emerald-500/30 text-text-secondary hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-500/5 dark:hover:bg-emerald-500/10 active:scale-95 transition-all duration-100 cursor-pointer"
                >
                  Activate
                </button>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(gym.id, gym.name); }}
                className="px-2 py-1 text-[10px] font-bold font-mono uppercase tracking-wider rounded-[4px] border border-border-default hover:border-red-500/30 text-text-secondary hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/5 dark:hover:bg-red-500/10 active:scale-95 transition-all duration-100 cursor-pointer"
              >
                Delete
              </button>
            </div>
          );
        },
      },
    ];
    },
    [navigate, suspendGym, activateGym, deleteGym]
  );

  return (
    <div className="flex-1 w-full max-w-[1600px] mx-auto animate-fade-slide-up">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="font-bold text-xl sm:text-2xl text-text-primary tracking-tight">
            Gym <span className="text-text-secondary font-normal ml-0.5">Management</span>
          </h1>
          <p className="text-text-secondary mt-1 text-xs font-mono">
            Manage all gyms on the platform.
          </p>
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          size="lg"
          className="w-full sm:w-auto"
        >
          <Plus className="size-3.5" />
          <span>Create Gym</span>
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6 w-full">
        <div className="relative w-full sm:flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-text-muted" />
          <Input
            placeholder="Search gyms..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPagination((p) => ({ ...p, pageIndex: 0 })); }}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <div className="w-full sm:w-40">
          <Select
            value={statusFilter || "all"}
            onValueChange={(v) => { setStatusFilter(v === "all" ? "" : v); setPagination((p) => ({ ...p, pageIndex: 0 })); }}
          >
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="trial">Trial</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full sm:w-auto text-xs text-text-muted font-mono flex items-center justify-center sm:justify-start px-3 h-9 border border-border-default rounded-lg shrink-0">
          {meta.total} gym{(meta.total ?? 0) !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Error State */}
      {isError && !isLoading ? (
        <div className="glass-panel rounded-[16px] p-6">
          <ErrorState
            title="Failed to load gyms"
            message={error?.message || "Could not retrieve gym list."}
            onRetry={() => refetch()}
          />
        </div>
      ) : (
        <>
          {/* Desktop View: TanStack DataTable */}
          <div className="hidden lg:block">
            <DataTable
              columns={columns}
              data={gyms}
              pageCount={meta.totalPages}
              pagination={pagination}
              onPaginationChange={setPagination}
              sorting={sorting}
              onSortingChange={setSorting}
              rowSelection={rowSelection}
              onRowSelectionChange={setRowSelection}
              isLoading={isLoading}
              onRowClick={(row) => navigate(`/super-admin/gyms/${row.id}`)}
            />
          </div>

          {/* Mobile/Tablet View: Card List */}
          <div className="block lg:hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-40 w-full rounded-xl" />
                ))
              ) : gyms.length ? (
                gyms.map((gym) => (
                  <div
                    key={gym.id}
                    onClick={() => navigate(`/super-admin/gyms/${gym.id}`)}
                    className="flex flex-col p-4 rounded-xl border border-border-default bg-surface hover:border-border-hover transition-all duration-150 cursor-pointer group press-effect gap-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors truncate">
                            {gym.name}
                          </h3>
                          <span className="text-[10px] text-text-muted font-mono mt-0.5 block">
                            {gym.subdomain || "-"}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <Badge
                          variant={gym.isActive ? "success" : "secondary"}
                          className="text-[10px] px-2 py-0.5 font-bold"
                        >
                          {gym.isActive ? "Active" : "Suspended"}
                        </Badge>
                        <Badge
                          variant={statusVariant[gym.subscriptionStatus] || "secondary"}
                          className="text-[10px] px-2 py-0.5 font-bold"
                        >
                          {SUBSCRIPTION_STATUS_LABELS[gym.subscriptionStatus] || gym.subscriptionStatus}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-border-default/40 text-[11px] font-mono text-text-muted">
                      <span>Created: {format(parseISO(gym.createdAt), "MMM d, yyyy")}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-16 text-center">
                  <p className="text-text-muted text-xs font-mono uppercase tracking-wider">
                    No gyms found.
                  </p>
                </div>
              )}
            </div>

            {/* Mobile Pagination */}
            {meta.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 px-4 py-3 bg-surface border border-border-default rounded-xl">
                <div className="text-xs text-text-muted font-mono">
                  Page {pagination.pageIndex + 1} of {meta.totalPages}
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPagination(p => ({ ...p, pageIndex: Math.max(0, p.pageIndex - 1) }))}
                    disabled={pagination.pageIndex === 0}
                    className="p-1.5 px-3 border border-border-default rounded-lg text-text-secondary hover:text-text-primary hover:bg-elevated transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-xs font-medium"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPagination(p => ({ ...p, pageIndex: Math.min(meta.totalPages - 1, p.pageIndex + 1) }))}
                    disabled={pagination.pageIndex === meta.totalPages - 1}
                    className="p-1.5 px-3 border border-border-default rounded-lg text-text-secondary hover:text-text-primary hover:bg-elevated transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-xs font-medium"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Create Gym Modal */}
      <ResponsiveModal
        open={showCreate}
        onOpenChange={(open) => {
          setShowCreate(open);
          if (!open) setCreatedGymInfo(null);
        }}
        title={createdGymInfo ? "Credentials Generated" : "Create New Gym"}
        description={createdGymInfo ? "Temporary credentials for the new gym administrator." : "Register a new gym on the platform."}
      >
        <div className="p-6">
          {createdGymInfo ? (
            <div className="space-y-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 mx-auto">
                <CheckCircle2 className="size-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-text-primary">Gym Created Successfully!</h3>
                <p className="text-xs text-text-secondary mt-1">
                  Please share these temporary credentials and URL with the gym administrator.
                </p>
              </div>

              <div className="rounded-xl border border-border-default bg-surface-hover/30 p-4 text-left space-y-3.5 font-mono text-xs">
                <div className="flex justify-between items-center py-1 border-b border-border-default/40">
                  <span className="text-text-muted">Gym Name</span>
                  <span className="font-semibold text-text-primary text-right truncate max-w-[200px]">{createdGymInfo.name}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-border-default/40">
                  <span className="text-text-muted">Subdomain</span>
                  <span className="font-semibold text-text-primary">{createdGymInfo.subdomain}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-border-default/40">
                  <span className="text-text-muted">Admin Email</span>
                  <span className="font-semibold text-text-primary">{createdGymInfo.email}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-border-default/40">
                  <span className="text-text-muted">Temp Password</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-primary">{createdGymInfo.temporaryPassword}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(createdGymInfo.temporaryPassword);
                        toast.success("Password copied to clipboard");
                      }}
                      className="p-1 hover:bg-surface-hover rounded text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                    >
                      <Copy className="size-3.5" />
                    </button>
                  </div>
                </div>
                <div className="pt-2">
                  <span className="text-text-muted block mb-1">Login URL</span>
                  <a
                    href={`http://${createdGymInfo.subdomain}.localhost:3000/login`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-primary hover:underline break-all block flex items-center gap-1"
                  >
                    http://{createdGymInfo.subdomain}.localhost:3000/login
                    <ExternalLink className="size-3" />
                  </a>
                </div>
              </div>

              <Button
                onClick={() => {
                  setShowCreate(false);
                  setCreatedGymInfo(null);
                  refetch();
                }}
                className="w-full"
              >
                Close & Finish
              </Button>
            </div>
          ) : (
            <CreateGymForm
              onSuccess={(result) => {
                setCreatedGymInfo({
                  name: result.gym.name,
                  subdomain: result.gym.subdomain,
                  email: result.admin.email,
                  temporaryPassword: result.temporaryPassword,
                });
              }}
              onCancel={() => setShowCreate(false)}
            />
          )}
        </div>
      </ResponsiveModal>
    </div>
  );
}
