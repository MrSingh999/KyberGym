import { Notification } from "../types";
import { NotificationItem } from "./NotificationItem";
import { Skeleton } from "@/components/feedback/Skeleton";
import { Bell } from "lucide-react";

interface NotificationsListProps {
  notifications: Notification[];
  isLoading?: boolean;
  onMarkRead?: (id: string) => void;
  compact?: boolean;
}

export function NotificationsList({ notifications, isLoading, onMarkRead, compact }: NotificationsListProps) {
  if (isLoading) {
    return (
      <div className="space-y-2 p-2">
        {Array.from({ length: compact ? 3 : 5 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 p-3">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="py-8 text-center text-muted">
        <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
        <p className="text-sm">No notifications yet</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-default">
      {notifications.map((n) => (
        <NotificationItem
          key={n.id}
          notification={n}
          onMarkRead={onMarkRead}
          compact={compact}
        />
      ))}
    </div>
  );
}
