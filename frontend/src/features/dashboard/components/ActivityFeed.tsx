import React from "react";
import { CreditCard, UserPlus, RefreshCw, Dumbbell } from "lucide-react";
import { WidgetContainer, WidgetHeader, WidgetBody } from "../widgets/WidgetContainer";
import { useDashboardActivities } from "../hooks/useDashboardActivities";

const iconMap = {
  member_joined: { icon: UserPlus, bg: "bg-primary/10", color: "text-primary" },
  payment_received: { icon: CreditCard, bg: "bg-success/10", color: "text-success" },
  membership_renewed: { icon: RefreshCw, bg: "bg-warning/10", color: "text-warning" },
  workout_assigned: { icon: Dumbbell, bg: "bg-secondary/10", color: "text-secondary" },
};

export function ActivityFeed() {
  const { data: activities, isLoading } = useDashboardActivities();

  return (
    <WidgetContainer className="h-full">
      <WidgetHeader title="Recent Activity" />
      <WidgetBody isLoading={isLoading} isEmpty={activities?.length === 0} scrollable>
        <div className="space-y-6">
          {activities?.map((activity, index) => {
            const config = iconMap[activity.type];
            const Icon = config.icon;
            
            return (
              <div key={activity.id} className="relative flex gap-4">
                {/* Timeline connector */}
                {index !== activities.length - 1 && (
                  <div className="absolute left-5 top-10 bottom-[-24px] w-px bg-subtle" />
                )}
                
                <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${config.bg} ${config.color} ring-4 ring-surface`}>
                  <Icon className="h-4 w-4" />
                </div>
                
                <div className="flex flex-col flex-1 pt-1 min-w-0">
                  <p className="text-sm font-medium text-primary truncate">
                    {activity.title}
                  </p>
                  <p className="text-sm text-secondary truncate">
                    {activity.description}
                  </p>
                  <span className="text-xs text-muted mt-1">
                    {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </WidgetBody>
    </WidgetContainer>
  );
}
