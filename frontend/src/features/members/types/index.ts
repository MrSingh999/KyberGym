export type MembershipStatus = "Active" | "Expiring Soon" | "Expired" | "Suspended";
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
  planName?: string;
  assignedTrainerName?: string;
  createdAt: string;
  updatedAt: string;
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
