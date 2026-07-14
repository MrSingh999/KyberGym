import { useAuthStore } from "@/store/auth.store";
import { useNotifications } from "@/features/notifications/hooks/useNotifications";
import { Dumbbell, Bell, User, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router";

function Greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

export function MemberDashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { data: notifData } = useNotifications({ page: 1, limit: 3, read: false });

  const notifications = notifData?.data ?? [];
  const unreadCount = notifData?.meta?.total ?? 0;

  const quickLinks = [
    { label: "My Workout Plan", href: "/member/workout-plan", icon: Dumbbell, color: "bg-blue-500/10 text-blue-600" },
    { label: "Notifications", href: "/member/notifications", icon: Bell, color: "bg-purple-500/10 text-purple-600" },
    { label: "My Profile", href: "/member/profile", icon: User, color: "bg-emerald-500/10 text-emerald-600" },
  ];

  return (
    <div className="p-4 sm:p-6 flex-1 w-full max-w-3xl mx-auto">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-h2 font-heading font-bold text-primary">
          <Greeting />{user?.name ? `, ${user.name.split(" ")[0]}` : ""}!
        </h1>
        <p className="text-sm text-muted mt-1">Here's what's happening at your gym.</p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        {quickLinks.map((link) => (
          <button
            key={link.href}
            onClick={() => navigate(link.href)}
            className="flex items-center gap-3 p-4 rounded-xl border border-default bg-surface hover:shadow-sm hover:border-primary/20 transition-all text-left"
          >
            <div className={`w-10 h-10 rounded-xl ${link.color} flex items-center justify-center`}>
              <link.icon className="w-5 h-5" />
            </div>
            <span className="font-medium text-sm text-primary">{link.label}</span>
            <ChevronRight className="w-4 h-4 text-muted ml-auto" />
          </button>
        ))}
      </div>

      {/* Recent Notifications */}
      <div className="rounded-xl border border-default bg-surface overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-default">
          <h2 className="font-semibold text-sm text-primary flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Recent Notifications
            {unreadCount > 0 && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </h2>
          <button
            onClick={() => navigate("/member/notifications")}
            className="text-xs text-primary hover:underline"
          >
            View all
          </button>
        </div>

        <div className="divide-y divide-default">
          {notifications.length === 0 ? (
            <div className="py-8 text-center">
              <Bell className="w-6 h-6 text-muted mx-auto mb-2 opacity-30" />
              <p className="text-sm text-muted">All caught up!</p>
            </div>
          ) : (
            notifications.slice(0, 3).map((n) => (
              <div key={n.id} className="px-4 py-3 hover:bg-surface-hover transition-colors">
                <p className="text-sm font-medium text-primary">{n.title}</p>
                <p className="text-xs text-muted mt-0.5 line-clamp-1">{n.message}</p>
              </div>
            ))
          )}
        </div>

        {notifications.length > 0 && (
          <div className="px-4 py-2 border-t border-default">
            <button
              onClick={() => navigate("/member/notifications")}
              className="w-full text-center text-xs text-primary hover:underline py-1"
            >
              View All Notifications
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
