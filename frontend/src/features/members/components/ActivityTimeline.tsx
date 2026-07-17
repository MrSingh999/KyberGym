import React from "react";
import { format, parseISO } from "date-fns";
import { UserPlus, RefreshCw, PauseCircle, PlayCircle, FileText, Dumbbell } from "lucide-react";
import { WidgetContainer } from "../../dashboard/widgets/WidgetContainer";
import { WidgetHeader } from "../../dashboard/widgets/WidgetHeader";
import { WidgetBody } from "../../dashboard/widgets/WidgetBody";
import { WidgetEmptyState } from "../../dashboard/widgets/WidgetEmptyState";
import { MemberActivity } from "../types/profile";
import { cn } from "@/lib/utils";

interface ActivityTimelineProps {
  activities?: MemberActivity[];
  isLoading: boolean;
}

const activityConfig = {
  member_created: { icon: UserPlus, color: "text-text-primary", bg: "bg-primary/10" },
  membership_renewed: { icon: RefreshCw, color: "text-success", bg: "bg-success/10" },
  membership_suspended: { icon: PauseCircle, color: "text-error", bg: "bg-error/10" },
  membership_activated: { icon: PlayCircle, color: "text-success", bg: "bg-success/10" },
  profile_updated: { icon: FileText, color: "text-text-secondary", bg: "bg-surface-hover" },
  note_added: { icon: FileText, color: "text-warning", bg: "bg-warning/10" },
  workout_assigned: { icon: Dumbbell, color: "text-text-primary", bg: "bg-primary/10" },
  payment_received: { icon: FileText, color: "text-success", bg: "bg-success/10" },
};

export function ActivityTimeline({ activities, isLoading }: ActivityTimelineProps) {
  return (
    <WidgetContainer>
      <WidgetHeader title="Activity Timeline" />
      <WidgetBody
        isLoading={isLoading}
        isEmpty={!activities?.length}
        emptyState={
          <WidgetEmptyState
            title="No Activity"
            description="Member activity and lifecycle events will appear here."
            icon={<FileText className="h-6 w-6 text-text-muted" />}
          />
        }
        scrollable
      >
        <div className="space-y-6">
          {activities?.map((event, index) => {
            const config = activityConfig[event.type] ?? activityConfig.profile_updated;
            const Icon = config.icon;

            return (
              <div key={event.id} className="relative flex gap-4">
                {index !== activities.length - 1 && (
                  <div className="absolute left-4 top-9 bottom-[-24px] w-px bg-border-default" />
                )}
                <div className={cn(
                  "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-4 ring-surface",
                  config.bg, config.color
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex flex-col flex-1 pt-1 min-w-0">
                  <p className="text-sm text-text-primary leading-relaxed">{event.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-text-muted">{event.actorName}</span>
                    <span className="text-xs text-text-muted">·</span>
                    <span className="text-xs text-text-muted">
                      {format(parseISO(event.createdAt), "MMM d, yyyy")}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </WidgetBody>
    </WidgetContainer>
  );
}
