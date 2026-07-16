export interface StaffUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: "staff" | "trainer" | "member" | "gym_admin";
  status: "active" | "inactive" | "suspended";
  avatar: string;
  isEmailVerified: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StaffUsersResponse {
  users: StaffUser[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  status?: string;
  avatar?: string;
}
