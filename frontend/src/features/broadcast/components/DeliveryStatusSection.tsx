import { useDeliveryLogs } from "../hooks/useBroadcasts";
import { DELIVERY_STATUS_LABELS, DeliveryLogStatus } from "../types";
import { Skeleton } from "@/components/feedback/Skeleton";
import { CheckCircle2, XCircle, Clock, Send, AlertCircle } from "lucide-react";

const STATUS_ICONS: Record<DeliveryLogStatus, React.ElementType> = {
  queued: Clock,
  sent: Send,
  delivered: CheckCircle2,
  read: CheckCircle2,
  failed: XCircle,
};

const STATUS_COLORS: Record<DeliveryLogStatus, string> = {
  queued: "text-muted",
  sent: "text-blue-500",
  delivered: "text-emerald-500",
  read: "text-emerald-600",
  failed: "text-destructive",
};

interface DeliveryStatusSectionProps {
  broadcastId: string;
}

export function DeliveryStatusSection({ broadcastId }: DeliveryStatusSectionProps) {
  const { data: logs, isLoading } = useDeliveryLogs(broadcastId);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-20 rounded-xl" />
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="rounded-xl border border-default bg-surface p-6 text-center">
        <AlertCircle className="w-6 h-6 text-muted mx-auto mb-2" />
        <p className="text-sm text-muted">No delivery logs yet.</p>
      </div>
    );
  }

  const summary = {
    total: logs.length,
    sent: logs.filter(l => l.status === "sent" || l.status === "delivered" || l.status === "read").length,
    failed: logs.filter(l => l.status === "failed").length,
    queued: logs.filter(l => l.status === "queued").length,
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-default bg-surface p-3 text-center">
          <p className="text-2xl font-bold text-primary">{summary.total}</p>
          <p className="text-[10px] text-muted font-medium uppercase tracking-wider mt-1">Total</p>
        </div>
        <div className="rounded-lg border border-default bg-surface p-3 text-center">
          <p className="text-2xl font-bold text-emerald-600">{summary.sent}</p>
          <p className="text-[10px] text-muted font-medium uppercase tracking-wider mt-1">Sent</p>
        </div>
        <div className="rounded-lg border border-default bg-surface p-3 text-center">
          <p className="text-2xl font-bold text-destructive">{summary.failed}</p>
          <p className="text-[10px] text-muted font-medium uppercase tracking-wider mt-1">Failed</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-default">
              <th className="text-left text-[10px] text-muted font-bold uppercase tracking-wider py-2 px-2">Member</th>
              <th className="text-left text-[10px] text-muted font-bold uppercase tracking-wider py-2 px-2">Status</th>
              <th className="text-left text-[10px] text-muted font-bold uppercase tracking-wider py-2 px-2">Error</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => {
              const Icon = STATUS_ICONS[log.status];
              return (
                <tr key={log.id} className="border-b border-default/50">
                  <td className="py-2.5 px-2">
                    <span className="text-primary text-xs font-medium">{log.memberName || log.memberId}</span>
                    {log.memberPhone && <span className="text-muted text-[10px] block">{log.memberPhone}</span>}
                  </td>
                  <td className="py-2.5 px-2">
                    <span className={`flex items-center gap-1 text-xs ${STATUS_COLORS[log.status]}`}>
                      <Icon className="w-3.5 h-3.5" />
                      {DELIVERY_STATUS_LABELS[log.status]}
                    </span>
                  </td>
                  <td className="py-2.5 px-2">
                    {log.errorMessage ? (
                      <span className="text-[10px] text-destructive">{log.errorMessage}</span>
                    ) : (
                      <span className="text-[10px] text-muted">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="block lg:hidden space-y-2">
        {logs.map((log) => {
          const Icon = STATUS_ICONS[log.status];
          return (
            <div key={log.id} className="rounded-lg border border-default bg-surface p-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-primary">{log.memberName || log.memberId}</p>
                {log.memberPhone && <p className="text-[10px] text-muted">{log.memberPhone}</p>}
                {log.errorMessage && <p className="text-[10px] text-destructive mt-0.5">{log.errorMessage}</p>}
              </div>
              <span className={`flex items-center gap-1 text-xs ${STATUS_COLORS[log.status]}`}>
                <Icon className="w-3.5 h-3.5" />
                {DELIVERY_STATUS_LABELS[log.status]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
