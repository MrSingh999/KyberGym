import { MemberDirectoryItem } from "./index";

// Extended full profile entity
export interface MemberProfile extends MemberDirectoryItem {
  dateOfBirth?: string;
  address?: string;
  bloodGroup?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  rawNotes?: string;
  notes?: MemberNote[];
  activeSubId?: string;
  subscriptionStatus?: string;
}

export interface MemberNote {
  id: string;
  content: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  authorName: string;
}

export interface MemberActivity {
  id: string;
  type:
    | "member_created"
    | "membership_renewed"
    | "membership_suspended"
    | "membership_activated"
    | "profile_updated"
    | "note_added"
    | "workout_assigned"
    | "payment_received";
  description: string;
  metadata?: Record<string, string | number>;
  createdAt: string;
  actorName: string;
}

export interface PaymentSummaryItem {
  id: string;
  amount: number;
  date: string;
  status: "paid" | "pending" | "failed";
  description: string;
}

export interface WorkoutSummaryItem {
  id: string;
  title: string;
  assignedAt: string;
  status: "in_progress" | "completed" | "not_started";
}

// Form data shapes
export interface CreateMemberFormStep1 {
  name: string;
  email: string;
  phone: string;
  gender: "male" | "female" | "other";
  dateOfBirth?: string;
  address?: string;
  bloodGroup?: string;
}

export interface CreateMemberFormStep2 {
  planId: string;
  membershipStartDate: string;
  membershipEndDate: string;
}

export interface CreateMemberFormStep3 {
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
}

export type CreateMemberFormData = CreateMemberFormStep1 &
  CreateMemberFormStep2 &
  CreateMemberFormStep3;

export interface RenewMembershipFormData {
  planId: string;
  startDate: string;
  endDate: string;
  paymentMethod: 'cash' | 'upi' | 'card' | 'bank_transfer';
}

export interface SuspendMemberFormData {
  reason: string;
}
