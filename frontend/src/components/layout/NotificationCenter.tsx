import { Bell } from "lucide-react";
import { useState } from "react";

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);

  return (
    <div className="relative">
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
        <>
          <div className="absolute right-0 mt-2 w-80 bg-elevated border border-default rounded-xl shadow-elevated overflow-hidden z-50 animate-fade-slide-up">
            <div className="flex items-center justify-between px-4 py-3 border-b border-subtle">
              <h3 className="font-semibold text-small text-primary">Notifications</h3>
              <button 
                onClick={() => setUnreadCount(0)}
                className="text-xs text-primary hover:underline font-medium"
              >
                Mark all read
              </button>
            </div>
            
            <div className="max-h-[300px] overflow-y-auto">
              {unreadCount > 0 ? (
                <div className="p-2 space-y-1">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-3 rounded-lg hover:bg-surface-hover cursor-pointer transition-colors border border-transparent hover:border-subtle">
                      <p className="text-small font-medium text-primary">New Payment Received</p>
                      <p className="text-caption text-muted mt-0.5">John Doe paid $50 for Monthly Plan.</p>
                      <p className="text-tiny text-muted mt-2">2 hours ago</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-muted">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">You're all caught up!</p>
                </div>
              )}
            </div>
          </div>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
        </>
      )}
    </div>
  );
}
