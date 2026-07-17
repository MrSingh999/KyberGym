export type MembershipStatus = "Active" | "Suspended" | "Inactive";
export type DueStatus = "due_soon" | "overdue";
export type Gender = "male" | "female" | "other";

export interface MemberDirectoryItem {
  id: string;
  memberCode: string;
  name: string;
  phone: string;
  email: string;
  profilePhoto?: string;
  gender: Gender;
  joiningDate: string;
  membershipStartDate?: string;
  membershipEndDate?: string;
  membershipStatus: MembershipStatus;
  dueStatus?: DueStatus;
  planName?: string;
  assignedTrainerName?: string;
  createdAt: string;
  updatedAt: string;
}

export function computeDueStatus(membershipEndDate?: string): DueStatus | undefined {
  if (!membershipEndDate) return undefined;
  const end = new Date(membershipEndDate);
  if (isNaN(end.getTime())) return undefined;
  const now = new Date();
  const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "overdue";
  if (diffDays <= 7) return "due_soon";
  return undefined;
}

export interface MembersResponse {
  data: MemberDirectoryItem[];
  meta: {
    pageIndex: number;
    pageSize: number;
    pageCount: number;
    totalCount: number;
  };
}
