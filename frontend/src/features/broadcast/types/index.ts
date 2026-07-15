export type BroadcastChannel = "whatsapp" | "email" | "inApp";
export type BroadcastStatus = "draft" | "scheduled" | "processing" | "completed" | "cancelled" | "failed";
export type RecipientTarget = "all" | "active" | "expired" | "dueToday" | "dueIn3Days" | "dueIn7Days" | "selected";
export type DeliveryLogStatus = "queued" | "sent" | "delivered" | "read" | "failed";

export interface Broadcast {
  id: string;
  gymId: string;
  title: string;
  channel: BroadcastChannel;
  messageTemplateId?: string;
  message?: string;
  recipientCriteria: {
    target: RecipientTarget;
    selectedMemberIds: string[];
  };
  status: BroadcastStatus;
  scheduledAt?: string;
  sentAt?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BroadcastListItem {
  id: string;
  title: string;
  channel: BroadcastChannel;
  status: BroadcastStatus;
  recipientTarget: RecipientTarget;
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
}

export interface DeliveryLog {
  id: string;
  gymId: string;
  broadcastId: string;
  memberId: string;
  memberName?: string;
  memberPhone?: string;
  status: DeliveryLogStatus;
  errorMessage?: string;
  sentAt?: string;
  createdAt: string;
}

export interface BroadcastFilters {
  channel?: BroadcastChannel;
  status?: BroadcastStatus;
}

export const BROADCAST_CHANNEL_LABELS: Record<BroadcastChannel, string> = {
  whatsapp: "WhatsApp",
  email: "Email",
  inApp: "In-App",
};

export const BROADCAST_STATUS_LABELS: Record<BroadcastStatus, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  processing: "Processing",
  completed: "Completed",
  cancelled: "Cancelled",
  failed: "Failed",
};

export const RECIPIENT_TARGET_LABELS: Record<RecipientTarget, string> = {
  all: "All Members",
  active: "Active Members",
  expired: "Expired Members",
  dueToday: "Due Today",
  dueIn3Days: "Due in 3 Days",
  dueIn7Days: "Due in 7 Days",
  selected: "Selected Members",
};

export const DELIVERY_STATUS_LABELS: Record<DeliveryLogStatus, string> = {
  queued: "Queued",
  sent: "Sent",
  delivered: "Delivered",
  read: "Read",
  failed: "Failed",
};
