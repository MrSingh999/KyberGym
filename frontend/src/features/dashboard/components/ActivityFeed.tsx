import { CreditCard, UserPlus, RefreshCw, Dumbbell, Activity } from "lucide-react";
import { useDashboardActivities } from "../hooks/useDashboardActivities";
import { WidgetContainer, WidgetHeader, WidgetBody } from "../widgets/WidgetContainer";
import { WidgetEmptyState } from "../widgets/WidgetEmptyState";
import { Skeleton } from "@/components/feedback/Skeleton";
import { ErrorState } from "@/components/feedback/ErrorState";

const iconMap = {
  member_joined: { icon: UserPlus, bg: "bg-primary/10", color: "text-primary" },
  payment_received: { icon: CreditCard, bg: "bg-success/10", color: "text-success" },
  membership_renewed: { icon: RefreshCw, bg: "bg-warning/10", color: "text-warning" },
  workout_assigned: { icon: Dumbbell, bg: "bg-secondary/10", color: "text-secondary" },
};

export function ActivityFeed() {
  const { data: activities, isLoading, isError, error, refetch } = useDashboardActivities();

  return (
    <WidgetContainer className="h-full">
      <WidgetHeader title="Recent Activity" description="Latest gym notifications" />
      <WidgetBody isLoading={false} isEmpty={false} scrollable>
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
                <div key={activity.id} className="relative flex gap-3">
                  {index !== activities.length - 1 && (
                    <div className="absolute left-[15px] top-[34px] bottom-[-20px] w-px bg-border-default" />
                  )}

                  <div className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] mt-1 ${config.bg} ${config.color} border border-border-default`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>

                  <div className="flex flex-col flex-1 min-w-0">
                    <p className="text-xs font-semibold text-text-primary font-mono truncate">
                      {activity.title}
                    </p>
                    <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                      {activity.description}
                    </p>
                    <span className="text-[10px] text-text-muted mt-1 font-mono">
                      {new Date(activity.timestamp).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
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
