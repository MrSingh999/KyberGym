import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Bell, ExternalLink, CheckCheck } from "lucide-react";
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
        className="min-h-[44px] min-w-[44px] flex items-center justify-center relative rounded-full hover:bg-surface-hover transition-colors text-text-muted hover:text-text-primary outline-none cursor-pointer"
        aria-label="View notifications"
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 flex size-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75" />
            <span className="relative inline-flex rounded-full size-2.5 bg-error" />
          </span>
        )}
      </button>

      {open && (
        <div className="fixed sm:absolute right-3 sm:right-0 left-3 sm:left-auto top-[68px] sm:top-auto sm:mt-2 w-auto sm:w-88 bg-canvas/95 backdrop-blur-xl border border-border-default rounded-2xl shadow-elevated overflow-hidden z-50 animate-fade-slide-up">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border-default bg-surface/50">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-text-primary">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-error/10 text-error border border-error/20">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <button
              onClick={handleViewAll}
              className="text-xs font-semibold text-text-muted hover:text-text-primary transition-colors flex items-center gap-1"
            >
              <CheckCheck className="size-3.5" />
              <span>Mark all</span>
            </button>
          </div>

          <div className="max-h-[360px] overflow-y-auto custom-scrollbar p-1">
            <NotificationsList
              notifications={notifications}
              isLoading={isLoading}
              onMarkRead={handleMarkRead}
              compact
            />
          </div>

          <div className="border-t border-border-default p-2 bg-surface/30">
            <button
              onClick={handleViewAll}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-text-primary hover:bg-surface-hover transition-colors min-h-[40px]"
            >
              <ExternalLink className="size-3.5" />
              <span>View All Notifications</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

