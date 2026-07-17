import { format, parseISO, differenceInDays } from "date-fns";
import { ScrollText, PauseCircle, StopCircle, CheckCircle2 } from "lucide-react";
import { WidgetContainer } from "../../dashboard/widgets/WidgetContainer";
import { WidgetHeader } from "../../dashboard/widgets/WidgetHeader";
import { WidgetBody } from "../../dashboard/widgets/WidgetBody";
import { WidgetEmptyState } from "../../dashboard/widgets/WidgetEmptyState";
import { useMemberSubscriptions } from "../hooks/useMemberSubscriptions";
import { cn } from "@/lib/utils";

interface MembershipHistoryProps {
  memberId: string;
}

const statusConfig = {
  active: { icon: CheckCircle2, label: "Active", color: "text-success", bg: "bg-success/10" },
  expired: { icon: StopCircle, label: "Expired", color: "text-text-muted", bg: "bg-surface-hover" },
  cancelled: { icon: StopCircle, label: "Cancelled", color: "text-error", bg: "bg-error/10" },
  paused: { icon: PauseCircle, label: "Paused", color: "text-warning", bg: "bg-warning/10" },
};

function formatDate(dateStr: string) {
  try {
    return format(parseISO(dateStr), "MMM d, yyyy");
  } catch {
    return dateStr;
  }
}

export function MembershipHistory({ memberId }: MembershipHistoryProps) {
  const { data, isLoading } = useMemberSubscriptions(memberId);
  const subscriptions = data?.data || [];

  const sorted = [...subscriptions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <WidgetContainer>
      <WidgetHeader title="Membership History" />
      <WidgetBody
        isLoading={isLoading}
        isEmpty={!sorted.length}
        emptyState={
          <WidgetEmptyState
            title="No Subscription History"
            description="Past and current subscriptions will appear here."
            icon={<ScrollText className="h-6 w-6 text-text-muted" />}
          />
        }
        scrollable
      >
        <div className="space-y-3">
          {sorted.map((sub) => {
            const config = statusConfig[sub.status] || statusConfig.expired;
            const Icon = config.icon;
            const daysDiff = differenceInDays(new Date(sub.endDate), new Date(sub.startDate));

            return (
              <div
                key={sub.id}
                className="flex items-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl border border-border-default bg-surface-hover/50"
              >
                <div className={cn("h-8 w-8 shrink-0 rounded-lg flex items-center justify-center", config.bg, config.color)}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-text-primary truncate">
                      {sub.membershipPlanId?.name || "Membership Plan"}
                    </span>
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0", config.bg, config.color, "border-current/20")}>
                      {config.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-text-muted font-mono">
                    <span>{formatDate(sub.startDate)} → {formatDate(sub.endDate)}</span>
                    <span>({daysDiff} days)</span>
                    {sub.finalAmount > 0 && <span>${sub.finalAmount.toFixed(2)}</span>}
                  </div>
                  {sub.notes && (
                    <p className="text-xs text-text-muted mt-1 italic">{sub.notes}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </WidgetBody>
    </WidgetContainer>
  );
}
