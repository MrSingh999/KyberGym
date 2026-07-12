import { create } from "zustand";

interface NotificationState {
  isOpen: boolean;
  unreadCount: number;
  setOpen: (open: boolean) => void;
  setUnreadCount: (count: number) => void;
  markAllAsRead: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  (set) => ({
    isOpen: false,
    unreadCount: 3, // Mock data for now
    setOpen: (open) => set({ isOpen: open }),
    setUnreadCount: (count) => set({ unreadCount: count }),
    markAllAsRead: () => set({ unreadCount: 0 }),
  })
);
