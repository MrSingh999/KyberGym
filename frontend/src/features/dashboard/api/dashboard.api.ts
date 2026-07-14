import { subDays, format } from "date-fns";
import { apiClient } from "@/lib/apiClient";
import { DashboardStats } from "../hooks/useDashboardStats";
import { DueTrackingResponse } from "../hooks/useDashboardDues";
import { RevenueDataPoint } from "../hooks/useDashboardRevenue";
import { Activity } from "../hooks/useDashboardActivities";

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await apiClient.get("/dashboard/overview");
  return response.data.data;
}

export async function fetchDueTracking(): Promise<DueTrackingResponse> {
  const response = await apiClient.get("/dashboard/due-tracking");
  return response.data.data;
}

interface PaymentRecord {
  _id: string;
  amount: number;
  paymentDate: string;
  status: string;
}

export async function fetchRevenueData(days: number = 7): Promise<RevenueDataPoint[]> {
  const response = await apiClient.get("/payments", {
    params: { limit: 100, page: 1 },
  });

  const payments: PaymentRecord[] = response.data.data || [];

  const dayMap = new Map<string, { revenue: number; members: Set<string> }>();

  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const key = format(subDays(today, i), "yyyy-MM-dd");
    dayMap.set(key, { revenue: 0, members: new Set() });
  }

  for (const payment of payments) {
    if (payment.status !== "completed") continue;
    const dateKey = format(new Date(payment.paymentDate), "yyyy-MM-dd");
    if (dayMap.has(dateKey)) {
      const entry = dayMap.get(dateKey)!;
      entry.revenue += payment.amount;
    }
  }

  return Array.from(dayMap.entries()).map(([date, data]) => ({
    date,
    revenue: data.revenue,
    members: data.members.size,
  }));
}

interface NotificationRecord {
  _id: string;
  type: string;
  title: string;
  message: string;
  createdAt: string;
}

export async function fetchRecentActivities(limit: number = 10): Promise<Activity[]> {
  const response = await apiClient.get("/notifications", {
    params: { limit, page: 1 },
  });

  const notifications: NotificationRecord[] = response.data.data || [];

  return notifications.map((n) => ({
    id: n._id,
    type: mapNotificationType(n.type),
    title: n.title,
    description: n.message,
    timestamp: n.createdAt,
  }));
}

function mapNotificationType(type: string): Activity["type"] {
  switch (type) {
    case "paymentReceived":
      return "payment_received";
    case "paymentDue":
    case "membershipExpired":
      return "membership_renewed";
    case "workoutAssigned":
      return "workout_assigned";
    case "broadcast":
    case "system":
      return "member_joined";
    default:
      return "member_joined";
  }
}

interface MemberRecord {
  _id: string;
  memberCode: string;
  fullName: string;
  email: string;
  phone: string;
  profilePhoto?: string;
  status: string;
  joinDate: string;
  createdAt: string;
}

export interface RecentMember {
  id: string;
  memberCode: string;
  fullName: string;
  email: string;
  phone: string;
  profilePhoto?: string;
  status: string;
  joinDate: string;
}

export async function fetchRecentMembers(limit: number = 5): Promise<RecentMember[]> {
  const response = await apiClient.get("/members", {
    params: { limit, page: 1 },
  });

  const members: MemberRecord[] = response.data.data || [];

  return members.map((m) => ({
    id: m._id,
    memberCode: m.memberCode,
    fullName: m.fullName,
    email: m.email,
    phone: m.phone,
    profilePhoto: m.profilePhoto,
    status: m.status,
    joinDate: m.joinDate,
  }));
}
