export type NotificationType = "paymentDue" | "paymentReceived" | "membershipExpired" | "workoutAssigned" | "broadcast" | "system";

export interface Notification {
  id: string;
  gymId: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  data: Notification[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  paymentDue: "Payment Due",
  paymentReceived: "Payment Received",
  membershipExpired: "Membership Expired",
  workoutAssigned: "Workout Assigned",
  broadcast: "Broadcast",
  system: "System",
};
