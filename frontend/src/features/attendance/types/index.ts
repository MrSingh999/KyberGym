export type AttendanceStatus = "present" | "absent" | "late";
export type AttendancePeriod = "today" | "yesterday" | "week" | "month";

export interface AttendanceRecord {
  id: string;
  memberId: string;
  memberName: string;
  memberCode: string;
  profilePhoto?: string;
  phone?: string;
  membershipStatus: string;
  planName?: string;
  status: AttendanceStatus;
  checkInTime: string;
  checkOutTime?: string;
  date: string;
  notes?: string;
  markedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceStats {
  today: {
    total: number;
    present: number;
    absent: number;
    late: number;
    percentage: number;
  };
  week: {
    total: number;
    present: number;
    absent: number;
    late: number;
    percentage: number;
  };
  month: {
    total: number;
    present: number;
    absent: number;
    late: number;
    percentage: number;
    mostActive?: { memberName: string; count: number }[];
  };
}

export interface AttendanceResponse {
  data: AttendanceRecord[];
  meta: {
    pageIndex: number;
    pageSize: number;
    pageCount: number;
    totalCount: number;
  };
}

export interface AttendanceFilters {
  search: string;
  status: AttendanceStatus | "all";
  period: AttendancePeriod | "all";
  date: string;
}
