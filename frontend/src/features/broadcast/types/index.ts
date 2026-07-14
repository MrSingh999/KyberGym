export type BroadcastChannel = "whatsapp" | "email" | "inApp";
export type BroadcastStatus = "draft" | "scheduled" | "processing" | "completed" | "cancelled" | "failed";
export type TemplateType = "paymentDue" | "paymentReceived" | "membershipExpired" | "workoutAssigned" | "custom";

export interface MessageTemplate {
  id: string;
  gymId: string;
  name: string;
  type: TemplateType;
  channel: BroadcastChannel;
  subject?: string;
  content: string;
  variables: string[];
  active: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Broadcast {
  id: string;
  gymId: string;
  title: string;
  channel: BroadcastChannel;
  messageTemplateId?: string;
  message?: string;
  recipientCriteria: {
    target: "all" | "active" | "expired" | "dueToday" | "dueIn3Days" | "dueIn7Days" | "selected";
    selectedMemberIds: string[];
  };
  status: BroadcastStatus;
  scheduledAt?: string;
  sentAt?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryLog {
  id: string;
  gymId: string;
  broadcastId: string;
  memberId: string;
  status: "pending" | "sent" | "delivered" | "read" | "failed";
  errorMessage?: string;
  sentAt?: string;
  createdAt: string;
}
