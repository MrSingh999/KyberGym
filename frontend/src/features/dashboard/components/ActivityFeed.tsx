import { format, parseISO } from "date-fns";
import { CreditCard, UserPlus, RefreshCw, Dumbbell, Activity } from "lucide-react";
import { useDashboardActivities } from "../hooks/useDashboardActivities";
import { WidgetContainer, WidgetHeader, WidgetBody } from "../widgets/WidgetContainer";
import { WidgetEmptyState } from "../widgets/WidgetEmptyState";
import { Skeleton } from "@/components/feedback/Skeleton";
import { ErrorState } from "@/components/feedback/ErrorState";

import { cn } from "@/lib/utils";

const iconMap = {
  member_joined: { icon: UserPlus, bg: "bg-primary/10", color: "text-primary" },
  payment_received: { icon: CreditCard, bg: "bg-success/10", color: "text-success" },
  membership_renewed: { icon: RefreshCw, bg: "bg-warning/10", color: "text-warning" },
  workout_assigned: { icon: Dumbbell, bg: "bg-secondary/10", color: "text-secondary" },
};

export function ActivityFeed({ className }: { className?: string }) {
  const { data: activities, isLoading, isError, error, refetch } = useDashboardActivities();

  return (
    <WidgetContainer className={className}>
      <WidgetHeader title="Recent Activity" description="Latest gym notifications" />
      <WidgetBody isLoading={isLoading} isEmpty={false} scrollable className="flex-1 overflow-y-auto custom-scrollbar">
        {isLoading ? (
          <div className="space-y-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-7 w-7 rounded-[6px] shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-44" />
                  <Skeleton className="h-2 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <ErrorState
            title="Failed to load"
            message={error?.message || "Could not load recent activities"}
            onRetry={() => refetch()}
          />
        ) : !activities || activities.length === 0 ? (
          <WidgetEmptyState
            icon={<Activity className="h-8 w-8" />}
            title="No recent activity"
            description="Activities will appear here as you use the system."
          />
        ) : (
          <div className="space-y-5">
            {activities.map((activity, index) => {
              const config = iconMap[activity.type] || iconMap.member_joined;
              const Icon = config.icon;

              return (
                <div key={activity.id} className="relative flex gap-3 group p-2 sm:p-1.5 rounded-lg transition-all duration-300 hover:bg-surface-hover/20">
                  {index !== activities.length - 1 && (
                    <div className="absolute left-[21px] top-[36px] bottom-[-22px] w-px bg-border-default/60 group-hover:bg-border-hover/60 transition-colors" />
                  )}

                  <div className={cn(
                    "relative z-10 flex h-9 w-9 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg mt-0.5 border transition-all duration-300 shadow-sm",
                    config.bg,
                    config.color,
                    activity.type === 'member_joined' && "border-primary/20 group-hover:shadow-[0_0_10px_rgba(var(--primary-rgb),0.2)]",
                    activity.type === 'payment_received' && "border-success/20 group-hover:shadow-[0_0_10px_rgba(var(--success-rgb),0.2)]",
                    activity.type === 'membership_renewed' && "border-warning/20 group-hover:shadow-[0_0_10px_rgba(var(--warning-rgb),0.2)]",
                    !['member_joined', 'payment_received', 'membership_renewed'].includes(activity.type) && "border-border-default"
                  )}>
                    <Icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                  </div>

                  <div className="flex flex-col flex-1 min-w-0">
                    <p className="text-sm sm:text-xs font-bold text-text-primary font-sans group-hover:text-primary transition-colors duration-200 truncate">
                      {activity.title}
                    </p>
                    <p className="text-sm sm:text-xs text-text-secondary mt-0.5 leading-relaxed">
                      {activity.description}
                    </p>
                    <span className="text-[10px] sm:text-[9px] text-text-muted mt-1 font-mono">
                      {format(parseISO(activity.timestamp), "MMM d, h:mm a")}
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
