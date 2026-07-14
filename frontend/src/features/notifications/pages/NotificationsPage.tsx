import { useState } from "react";
import { toast } from "sonner";
import { Bell, CheckCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from "../hooks/useNotifications";
import { NotificationsList } from "../components/NotificationsList";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function NotificationsPage() {
  const [page, setPage] = useState(1);
  const [readFilter, setReadFilter] = useState<boolean | undefined>(undefined);
  const limit = 10;

  const { data, isLoading } = useNotifications({ page, limit, read: readFilter });
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllAsRead();

  const notifications = data?.data ?? [];
  const meta = data?.meta;

  const handleMarkRead = (id: string) => {
    markAsRead(id, {
      onError: () => toast.error("Failed to mark as read"),
    });
  };

  const handleMarkAllRead = () => {
    markAllAsRead(undefined, {
      onSuccess: () => toast.success("All notifications marked as read"),
      onError: () => toast.error("Failed to mark all as read"),
    });
  };

  const totalPages = meta?.totalPages ?? 1;

  return (
    <div className="flex flex-col min-h-full bg-canvas">
      <div className="p-4 sm:p-6 lg:p-8 flex-1 w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-h2 font-heading font-bold text-primary">Notifications</h1>
            <p className="text-sm text-muted mt-1">Stay updated with gym activities.</p>
          </div>
          <Button variant="outline" onClick={handleMarkAllRead} disabled={isMarkingAll || notifications.length === 0}>
            <CheckCheck className="w-4 h-4 mr-1.5" />
            Mark All Read
          </Button>
        </div>

        {/* Filter tabs */}
        <Tabs
          value={readFilter === undefined ? "all" : readFilter ? "read" : "unread"}
          onValueChange={(v) => {
            setReadFilter(v === "all" ? undefined : v === "read" ? true : false);
            setPage(1);
          }}
          className="mb-6"
        >
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
            <TabsTrigger value="read">Read</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Content */}
        <div className="rounded-xl border border-default bg-surface shadow-sm overflow-hidden">
          <NotificationsList
            notifications={notifications}
            isLoading={isLoading}
            onMarkRead={handleMarkRead}
          />
        </div>

        {/* Pagination */}
        {meta && meta.total > 0 && (
          <div className="flex items-center justify-between mt-4 text-sm text-muted">
            <span>
              Showing {(meta.page - 1) * meta.limit + 1}–{Math.min(meta.page * meta.limit, meta.total)} of {meta.total}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg hover:bg-surface-hover disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="tabular-nums">
                Page {meta.page} of {meta.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg hover:bg-surface-hover disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && meta?.total === 0 && (
          <div className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-surface-hover border border-default flex items-center justify-center mx-auto mb-4">
              <Bell className="w-7 h-7 text-muted" />
            </div>
            <h3 className="font-heading font-semibold text-lg text-primary mb-2">
              {readFilter !== undefined ? "No matching notifications" : "All caught up!"}
            </h3>
            <p className="text-sm text-muted max-w-xs mx-auto">
              {readFilter !== undefined
                ? "Try changing the filter to see more notifications."
                : "You have no notifications at the moment."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
