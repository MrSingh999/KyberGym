import { format, parseISO } from "date-fns";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { ColumnDef, PaginationState, SortingState, RowSelectionState } from "@tanstack/react-table";
import { Plus, Search } from "lucide-react";
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
          <span
            className="font-semibold text-text-primary text-sm cursor-pointer hover:text-primary transition-colors"
            onClick={() => navigate(`/super-admin/gyms/${row.original.id}`)}
          >
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
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => (
          <span className="text-text-muted text-xs font-mono">
            {format(parseISO(row.original.createdAt), "MMM d, yyyy")}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const gym = row.original;
          return (
            <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
              {gym.isActive ? (
                <button
                  onClick={() => handleSuspend(gym.id, gym.name)}
                  className="px-2 py-1 text-[10px] font-bold font-mono uppercase tracking-wider rounded-[4px] border border-amber-500/20 text-amber-600 bg-amber-500/5 hover:bg-amber-500/10 active:bg-amber-500/15 transition-colors duration-100 cursor-pointer press-effect"
                >
                  Suspend
                </button>
              ) : (
                <button
                  onClick={() => handleActivate(gym.id, gym.name)}
                  className="px-2 py-1 text-[10px] font-bold font-mono uppercase tracking-wider rounded-[4px] border border-emerald-500/20 text-emerald-600 bg-emerald-500/5 hover:bg-emerald-500/10 active:bg-emerald-500/15 transition-colors duration-100 cursor-pointer press-effect"
                >
                  Activate
                </button>
              )}
              <button
                onClick={() => handleDelete(gym.id, gym.name)}
                className="px-2 py-1 text-[10px] font-bold font-mono uppercase tracking-wider rounded-[4px] border border-red-500/20 text-red-600 bg-red-500/5 hover:bg-red-500/10 active:bg-red-500/15 transition-colors duration-100 cursor-pointer press-effect"
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
    <div className="p-4 sm:p-6 lg:p-8 flex-1 w-full max-w-[1600px] mx-auto animate-fade-slide-up">

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
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
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
        <div className="text-xs text-text-muted font-mono flex items-center px-3 h-9 border border-border-default rounded-lg shrink-0">
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
        />
      )}

      {/* Create Gym Modal */}
      <ResponsiveModal
        open={showCreate}
        onOpenChange={setShowCreate}
        title="Create New Gym"
        description="Register a new gym on the platform."
      >
        <div className="p-6">
          <CreateGymForm
            onSuccess={() => {
              setShowCreate(false);
              refetch();
            }}
            onCancel={() => setShowCreate(false)}
          />
        </div>
      </ResponsiveModal>
    </div>
  );
}
