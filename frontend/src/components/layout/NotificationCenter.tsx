import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Bell, ExternalLink } from "lucide-react";
import { useNotificationStore } from "../../store/notification.store";
import { useNotifications, useMarkAsRead, useUnreadCount } from "../../features/notifications/hooks/useNotifications";
import { NotificationsList } from "../../features/notifications/components/NotificationsList";
import { useAuthStore } from "../../store/auth.store";

export function NotificationCenter() {
  const { unreadCount } = useNotificationStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useUnreadCount();

  const { data, isLoading } = useNotifications({
    page: 1,
    limit: 5,
    read: false,
  });
  const { mutate: markAsRead } = useMarkAsRead();

  const notifications = data?.data ?? [];

  const handleMarkRead = (id: string) => {
    markAsRead(id);
  };

  const handleViewAll = () => {
    setOpen(false);
    if (user?.role === "owner") {
      navigate("/admin/notifications");
    } else {
      navigate("/member/notifications");
    }
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-notification-center]")) {
        setOpen(false);
      }
    };
    setTimeout(() => document.addEventListener("click", handler), 0);
    return () => document.removeEventListener("click", handler);
  }, [open]);

  return (
    <div data-notification-center className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full hover:bg-surface-hover transition-colors text-muted hover:text-primary outline-none"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full animate-pulse" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-elevated border border-default rounded-xl shadow-elevated overflow-hidden z-50 animate-fade-slide-up">
          <div className="flex items-center justify-between px-4 py-3 border-b border-subtle">
            <h3 className="font-semibold text-small text-primary">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-1.5 text-xs text-muted">({unreadCount})</span>
              )}
            </h3>
          </div>

          <div className="max-h-[360px] overflow-y-auto custom-scrollbar">
            <NotificationsList
              notifications={notifications}
              isLoading={isLoading}
              onMarkRead={handleMarkRead}
              compact
            />
          </div>

          <div className="border-t border-subtle p-2">
            <button
              onClick={handleViewAll}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-sm text-primary hover:bg-surface-hover rounded-lg transition-colors font-medium"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View All Notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
