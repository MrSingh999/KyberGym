import { useState } from "react";
import { differenceInDays, startOfDay, parseISO } from "date-fns";
import { CheckCircle } from "lucide-react";
import { useNavigate } from "react-router";
import { useDashboardDues, DueMember } from "../hooks/useDashboardDues";
import { WidgetContainer, WidgetHeader, WidgetBody } from "../widgets/WidgetContainer";
import { WidgetEmptyState } from "../widgets/WidgetEmptyState";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/data-display/Avatar";
import { Skeleton } from "@/components/feedback/Skeleton";
import { ErrorState } from "@/components/feedback/ErrorState";
import { cn } from "@/lib/utils";

type Timeframe = "today" | "3days" | "7days";

export function ExpiringWidget() {
  const navigate = useNavigate();
  const { data: dues, isLoading, isError, error, refetch } = useDashboardDues();
  const [timeframe, setTimeframe] = useState<Timeframe>("7days");

  const items: DueMember[] =
    timeframe === "today"
      ? [...(dues?.overdue || []), ...(dues?.dueToday || [])]
      : timeframe === "3days"
        ? [...(dues?.overdue || []), ...(dues?.dueToday || []), ...(dues?.dueIn3Days || [])]
        : [...(dues?.overdue || []), ...(dues?.dueToday || []), ...(dues?.dueIn3Days || []), ...(dues?.dueIn7Days || [])];

  const getDaysDiff = (dateStr: string) => {
    if (!dateStr) return 0;
    return differenceInDays(startOfDay(parseISO(dateStr)), startOfDay(new Date()));
  };

  return (
    <WidgetContainer>
      <WidgetHeader
        title="Expiring Memberships"
        description="Upcoming and overdue renewals"
        action={
          <div className="flex bg-canvas border border-border-default p-0.5 rounded-[6px]">
            {[
              { val: "today" as const, label: "Today" },
              { val: "3days" as const, label: "3 Days" },
              { val: "7days" as const, label: "7 Days" },
            ].map((tf) => (
              <button
                key={tf.val}
                type="button"
                onClick={() => setTimeframe(tf.val)}
                className={cn(
                  "px-2 py-0.5 rounded-[4px] text-[9px] font-bold transition-all duration-200 cursor-pointer",
                  timeframe === tf.val
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-text-secondary hover:text-text-primary",
                )}
              >
                {tf.label}
              </button>
            ))}
          </div>
        }
      />
      <WidgetBody isLoading={false} isEmpty={false} scrollable>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <ErrorState
            title="Failed to load"
            message={error?.message || "Could not load expiry data"}
            onRetry={() => refetch()}
          />
        ) : items.length === 0 ? (
          <WidgetEmptyState
            icon={<CheckCircle className="h-8 w-8" />}
            title="All clear"
            description="No memberships expiring in this period."
          />
        ) : (
          <div className="space-y-2">
            {items.map((member) => {
              const daysDiff = getDaysDiff(member.endDate);
              const isOverdue = daysDiff < 0;
              const name = member.memberId?.fullName || "Unknown";
              const code = member.memberId?.memberCode || "";

              return (
                <div
                  key={member.id || member._id}
                  className={cn(
                  "flex items-center justify-between gap-3 p-3 rounded-xl border transition-all cursor-pointer hover:bg-surface-hover/30",
                  isOverdue
                    ? "border-error/20 hover:border-error/35 border-l-[3px] border-l-error"
                    : "border-border-default hover:border-border-hover border-l-[3px] border-l-warning",
                )}
                  onClick={() => navigate(`/admin/payments/collect?memberId=${member.memberId?.id || member.memberId?._id || member.memberId}`)}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarFallback>
                        {name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold text-text-primary truncate">
                        {name}
                      </span>
                      <span className="text-[10px] text-text-muted font-mono">
                        {code}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isOverdue ? (
                      <Badge variant="destructive" className="text-[9px]">
                        {Math.abs(daysDiff)}d overdue
                      </Badge>
                    ) : (
                      <Badge variant="warning" className="text-[9px]">
                        {daysDiff}d left
                      </Badge>
                    )}
                    <span className="text-[10px] font-mono text-text-muted">
                      ₹{(member.amount || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </WidgetBody>
    </WidgetContainer>
  );
}
