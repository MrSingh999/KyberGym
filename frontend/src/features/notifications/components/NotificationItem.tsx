import { Bell, CreditCard, Dumbbell, AlertTriangle, Calendar, Megaphone, Circle } from "lucide-react";
import { Notification, NotificationType } from "../types";
import { cn } from "@/lib/utils";

const TYPE_ICONS: Record<NotificationType, React.ElementType> = {
  paymentDue: CreditCard,
  paymentReceived: CreditCard,
  membershipExpired: Calendar,
  workoutAssigned: Dumbbell,
  broadcast: Megaphone,
  system: Bell,
};

const TYPE_COLORS: Record<NotificationType, string> = {
  paymentDue: "text-amber-500",
  paymentReceived: "text-emerald-500",
  membershipExpired: "text-red-500",
  workoutAssigned: "text-blue-500",
  broadcast: "text-purple-500",
  system: "text-zinc-500",
};

interface NotificationItemProps {
  notification: Notification;
  onMarkRead?: (id: string) => void;
  compact?: boolean;
}

export function NotificationItem({ notification, onMarkRead, compact }: NotificationItemProps) {
  const Icon = TYPE_ICONS[notification.type] || Bell;
  const iconColor = TYPE_COLORS[notification.type] || "text-muted";

  const timeAgo = getTimeAgo(notification.createdAt);

  return (
    <div
      className={cn(
        "relative flex items-start gap-3 p-3 rounded-lg transition-colors",
        !notification.read && "bg-primary/5",
        !notification.read && "border-l-2 border-l-primary",
        notification.read && "opacity-70",
        onMarkRead && "hover:bg-surface-hover cursor-pointer",
      )}
      onClick={() => {
        if (!notification.read && onMarkRead) {
          onMarkRead(notification.id);
        }
      }}
    >
      <div className={cn("w-8 h-8 rounded-lg bg-surface-hover flex items-center justify-center flex-shrink-0", iconColor)}>
        <Icon className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn("text-sm", notification.read ? "text-muted" : "font-semibold text-primary")}>
            {notification.title}
          </p>
          {!notification.read && (
            <Circle className="w-2 h-2 fill-primary text-primary flex-shrink-0 mt-1.5" />
          )}
        </div>
        <p className="text-xs text-muted mt-0.5 line-clamp-2">{notification.message}</p>
        <p className="text-tiny text-muted mt-1.5">{timeAgo}</p>
      </div>
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(dateStr).toLocaleDateString();
}
