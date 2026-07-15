import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { toast } from "sonner";
import { ArrowLeft, Send, Trash2 } from "lucide-react";
import { useBroadcast, useDeleteBroadcast, useSendBroadcast } from "../hooks/useBroadcasts";
import { BROADCAST_CHANNEL_LABELS, BROADCAST_STATUS_LABELS, RECIPIENT_TARGET_LABELS } from "../types";
import { DeliveryStatusSection } from "../components/DeliveryStatusSection";
import { Skeleton } from "@/components/feedback/Skeleton";
import { ErrorState } from "@/components/feedback/ErrorState";
import { Button, LoadingButton } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/ui/responsive-modal";

export function BroadcastDetailPage() {
  const { broadcastId } = useParams();
  const navigate = useNavigate();
  const { data: broadcast, isLoading, isError } = useBroadcast(broadcastId!);
  const { mutate: deleteBroadcast } = useDeleteBroadcast();
  const { mutate: sendBroadcast, isPending: isSending } = useSendBroadcast(broadcastId!);

  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const handleDelete = () => {
    if (!broadcastId) return;
    deleteBroadcast(broadcastId, {
      onSuccess: () => {
        toast.success("Broadcast deleted");
        navigate("/admin/broadcasts");
      },
      onError: () => toast.error("Failed to delete broadcast"),
    });
  };

  const handleSend = () => {
    sendBroadcast(undefined, {
      onSuccess: () => {
        toast.success("Broadcast queued for sending");
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || "Failed to send broadcast");
      },
    });
  };

  const canSend = broadcast && ["draft", "scheduled"].includes(broadcast.status);
  const canDelete = broadcast && broadcast.status !== "processing";

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  if (isError || !broadcast) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        <ErrorState
          title="Broadcast not found"
          message="The broadcast you're looking for doesn't exist."
          onRetry={() => navigate("/admin/broadcasts")}
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => navigate("/admin/broadcasts")}
        className="flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors mb-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Broadcasts
      </button>

      <div className="rounded-xl border border-hover bg-surface p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-default/40">
          <div>
            <h2 className="font-bold text-lg sm:text-xl text-primary">{broadcast.title}</h2>
            <p className="text-xs text-muted mt-1">
              Created {new Date(broadcast.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center">
            {canSend && (
              <LoadingButton onClick={handleSend} loading={isSending} size="sm">
                <Send className="w-4 h-4 mr-1.5" />
                Send Now
              </LoadingButton>
            )}
            {canDelete && (
              <button
                onClick={() => setDeleteConfirm(true)}
                className="p-2 border border-default rounded-lg text-muted hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-lg border border-default bg-surface p-4">
            <span className="text-[10px] text-muted font-bold uppercase tracking-wider block mb-1">Channel</span>
            <p className="text-sm font-semibold text-primary">{BROADCAST_CHANNEL_LABELS[broadcast.channel]}</p>
          </div>
          <div className="rounded-lg border border-default bg-surface p-4">
            <span className="text-[10px] text-muted font-bold uppercase tracking-wider block mb-1">Status</span>
            <p className="text-sm font-semibold text-primary">{BROADCAST_STATUS_LABELS[broadcast.status]}</p>
          </div>
          <div className="rounded-lg border border-default bg-surface p-4">
            <span className="text-[10px] text-muted font-bold uppercase tracking-wider block mb-1">Audience</span>
            <p className="text-sm font-semibold text-primary">{RECIPIENT_TARGET_LABELS[broadcast.recipientCriteria.target]}</p>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-[10px] text-muted font-bold uppercase tracking-wider">Message Content</h4>
          <div className="rounded-lg border border-default bg-surface/50 p-4">
            <p className="text-xs text-primary whitespace-pre-wrap">
              {broadcast.message || "Using message template"}
            </p>
          </div>
        </div>

        {broadcast.scheduledAt && (
          <div className="text-xs text-muted">
            Scheduled: {new Date(broadcast.scheduledAt).toLocaleString()}
          </div>
        )}
        {broadcast.sentAt && (
          <div className="text-xs text-muted">
            Sent: {new Date(broadcast.sentAt).toLocaleString()}
          </div>
        )}
      </div>

      {(broadcast.status === "processing" || broadcast.status === "completed" || broadcast.status === "failed") && (
        <div className="rounded-xl border border-hover bg-surface p-5 sm:p-6 space-y-4">
          <h3 className="font-bold text-sm text-primary">Delivery Status</h3>
          <DeliveryStatusSection broadcastId={broadcast.id} />
        </div>
      )}

      <ResponsiveModal open={deleteConfirm} onClose={() => setDeleteConfirm(false)}>
        <div className="p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-6 h-6 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold text-primary mb-2">Delete Broadcast?</h3>
          <p className="text-sm text-muted mb-6">This action cannot be undone.</p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => setDeleteConfirm(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </div>
        </div>
      </ResponsiveModal>
    </div>
  );
}
