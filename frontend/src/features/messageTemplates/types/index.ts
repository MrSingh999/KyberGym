export type TemplateType = "paymentDue" | "paymentReceived" | "membershipExpired" | "workoutAssigned" | "custom";
export type TemplateChannel = "whatsapp" | "email" | "inApp";

export interface MessageTemplate {
  id: string;
  gymId: string;
  name: string;
  type: TemplateType;
  channel: TemplateChannel;
  subject?: string;
  content: string;
  variables: string[];
  active: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessageTemplateListItem {
  id: string;
  name: string;
  type: TemplateType;
  channel: TemplateChannel;
  subject?: string;
  content: string;
  variables: string[];
  active: boolean;
  createdAt: string;
}

export interface MessageTemplateFilters {
  type?: TemplateType;
  channel?: TemplateChannel;
  active?: boolean;
}

export const TEMPLATE_TYPE_LABELS: Record<TemplateType, string> = {
  paymentDue: "Payment Due",
  paymentReceived: "Payment Received",
  membershipExpired: "Membership Expired",
  workoutAssigned: "Workout Assigned",
  custom: "Custom",
};

export const TEMPLATE_CHANNEL_LABELS: Record<TemplateChannel, string> = {
  whatsapp: "WhatsApp",
  email: "Email",
  inApp: "In-App",
};
