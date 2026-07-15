import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Plus, Megaphone, Trash2 } from "lucide-react";
import { useBroadcasts, useDeleteBroadcast } from "../hooks/useBroadcasts";
import { BROADCAST_CHANNEL_LABELS, BROADCAST_STATUS_LABELS, RECIPIENT_TARGET_LABELS, BroadcastStatus, BroadcastChannel } from "../types";
import { Skeleton } from "@/components/feedback/Skeleton";
import { ErrorState } from "@/components/feedback/ErrorState";
import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/ui/responsive-modal";

const STATUS_COLORS: Record<BroadcastStatus, string> = {
  draft: "bg-zinc-500/10 text-zinc-600 border-zinc-500/20",
  scheduled: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  processing: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  completed: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
};

export function BroadcastsPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [channelFilter, setChannelFilter] = useState<string>("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filters: Record<string, string> = {};
  if (statusFilter) filters.status = statusFilter;
  if (channelFilter) filters.channel = channelFilter;

  const { data, isLoading, isError, refetch } = useBroadcasts({ filters: filters as any });
  const { mutate: deleteBroadcast } = useDeleteBroadcast();

  const broadcasts = data?.data ?? [];
  const meta = data?.meta;

  const handleDelete = () => {
    if (!deleteConfirm) return;
    deleteBroadcast(deleteConfirm, {
      onSuccess: () => {
        toast.success("Broadcast deleted");
        setDeleteConfirm(null);
      },
      onError: () => {
        toast.error("Failed to delete broadcast");
        setDeleteConfirm(null);
      },
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-bold text-xl sm:text-2xl text-primary tracking-tight">
            Broadcasts
          </h1>
          <p className="text-muted mt-1 text-xs">Send bulk messages to your members.</p>
        </div>
        <button
          onClick={() => navigate("/admin/broadcasts/new")}
          className="flex items-center space-x-2 bg-primary text-primary-foreground hover:opacity-90 px-4 py-2.5 sm:py-2 rounded-lg font-semibold text-sm transition-all min-h-[44px] w-full sm:w-auto justify-center"
        >
          <Plus className="h-4 w-4" />
          <span>New Broadcast</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-lg border border-default bg-surface px-3 text-sm text-primary min-w-[130px]"
        >
          <option value="">All Statuses</option>
          {(Object.entries(BROADCAST_STATUS_LABELS) as [string, string][]).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select
          value={channelFilter}
          onChange={(e) => setChannelFilter(e.target.value)}
          className="h-10 rounded-lg border border-default bg-surface px-3 text-sm text-primary min-w-[120px]"
        >
          <option value="">All Channels</option>
          {(Object.entries(BROADCAST_CHANNEL_LABELS) as [string, string][]).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState title="Failed to load broadcasts" message="Could not fetch broadcasts." onRetry={() => refetch()} />
      ) : broadcasts.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-surface-hover border border-default rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Megaphone className="w-7 h-7 text-muted" />
          </div>
          <h3 className="font-semibold text-lg text-primary mb-2">No Broadcasts Yet</h3>
          <p className="text-sm text-muted max-w-xs mx-auto mb-4">Create your first broadcast message.</p>
          <Button onClick={() => navigate("/admin/broadcasts/new")}>Create Broadcast</Button>
        </div>
      ) : (
        <>
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-default">
                  <th className="text-left text-[10px] text-muted font-bold uppercase tracking-wider py-3 px-3">Title</th>
                  <th className="text-left text-[10px] text-muted font-bold uppercase tracking-wider py-3 px-3">Channel</th>
                  <th className="text-left text-[10px] text-muted font-bold uppercase tracking-wider py-3 px-3">Audience</th>
                  <th className="text-left text-[10px] text-muted font-bold uppercase tracking-wider py-3 px-3">Status</th>
                  <th className="text-left text-[10px] text-muted font-bold uppercase tracking-wider py-3 px-3">Created</th>
                  <th className="w-10 py-3 px-3" />
                </tr>
              </thead>
              <tbody>
                {broadcasts.map((b) => (
                  <tr
                    key={b.id}
                    className="border-b border-default/50 hover:bg-surface-hover/50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/admin/broadcasts/${b.id}`)}
                  >
                    <td className="py-3 px-3 font-medium text-primary text-xs">{b.title}</td>
                    <td className="py-3 px-3">
                      <span className="text-[10px] bg-surface-hover px-1.5 py-0.5 rounded border border-default">
                        {BROADCAST_CHANNEL_LABELS[b.channel]}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-xs text-muted">{RECIPIENT_TARGET_LABELS[b.recipientTarget]}</td>
                    <td className="py-3 px-3">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${STATUS_COLORS[b.status]}`}>
                        {BROADCAST_STATUS_LABELS[b.status]}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-xs text-muted">{new Date(b.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteConfirm(b.id); }}
                        className="p-1.5 text-muted hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="lg:hidden space-y-3">
            {broadcasts.map((b, i) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="rounded-xl border border-default bg-surface p-4 hover:border-hover transition-colors cursor-pointer"
                onClick={() => navigate(`/admin/broadcasts/${b.id}`)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-sm text-primary truncate">{b.title}</h4>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-[10px] bg-surface-hover px-1.5 py-0.5 rounded border border-default">
                        {BROADCAST_CHANNEL_LABELS[b.channel]}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${STATUS_COLORS[b.status]}`}>
                        {BROADCAST_STATUS_LABELS[b.status]}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted mt-1.5">
                      {RECIPIENT_TARGET_LABELS[b.recipientTarget]} · {new Date(b.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteConfirm(b.id); }}
                    className="p-2 text-muted hover:text-destructive transition-colors shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="text-center text-sm text-muted">
              Page {meta.page} of {meta.totalPages} ({meta.total} total)
            </div>
          )}
        </>
      )}

      <ResponsiveModal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <div className="p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-6 h-6 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold text-primary mb-2">Delete Broadcast?</h3>
          <p className="text-sm text-muted mb-6">This action cannot be undone.</p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </div>
        </div>
      </ResponsiveModal>
    </div>
  );
}
