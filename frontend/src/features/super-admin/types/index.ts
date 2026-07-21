export interface SuperAdminDashboard {
  totalGyms: number;
  activeGyms: number;
  suspendedGyms: number;
  trialGyms: number;
  totalMembers: number;
  activeSubscriptions: number;
  expiredSubscriptions: number;
}

export interface GymTenant {
  id: string;
  name: string;
  slug: string;
  subdomain?: string;
  owner?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  features: Record<string, boolean>;
  branding: {
    appName?: string;
    logo?: string;
    favicon?: string;
    primaryColor?: string;
    secondaryColor?: string;
    loginBanner?: string;
  };
  subscription: {
    plan?: string;
    status: "active" | "trial" | "expired" | "suspended";
    startDate?: string;
    expiresAt?: string;
    trialEndsAt?: string;
  };
  timezone: string;
  currency: string;
  language: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GymTenantListItem {
  id: string;
  name: string;
  subdomain?: string;
  subscriptionStatus: string;
  isActive: boolean;
  isDeleted?: boolean;
  deletedAt?: string;
  createdAt: string;
}

export const FEATURE_FLAGS = [
  { key: "workouts", label: "Workouts" },
  { key: "notifications", label: "Notifications" },
  { key: "attendance", label: "Attendance" },
  { key: "branding", label: "Branding" },
  { key: "memberPortal", label: "Member Portal" },
  { key: "staffPortal", label: "Staff Portal" },
  { key: "dietPlans", label: "Diet Plans" },
  { key: "qrEntry", label: "QR Entry" },
  { key: "whatsappBroadcast", label: "WhatsApp Broadcast" },
  { key: "analytics", label: "Analytics" },
] as const;

export const SUBSCRIPTION_STATUS_LABELS: Record<string, string> = {
  active: "Active",
  trial: "Trial",
  expired: "Expired",
  suspended: "Suspended",
};
