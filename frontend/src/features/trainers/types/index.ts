export type TrainerStatus = "ACTIVE" | "INACTIVE";

export interface Trainer {
  _id: string;
  publicId: string;
  gymId: string;
  userId: string;
  fullName: string;
  email: string;
  phone?: string;
  specialization?: string;
  joiningDate: string;
  status: TrainerStatus;
  createdBy: string;
  memberCount?: number;
  user?: {
    _id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    lastLogin?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TrainerListItem {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  specialization?: string;
  status: TrainerStatus;
  memberCount: number;
  joiningDate: string;
  lastLogin?: string;
}

export interface CreateTrainerData {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  specialization?: string;
}

export interface UpdateTrainerData {
  fullName?: string;
  email?: string;
  phone?: string;
  specialization?: string;
  status?: TrainerStatus;
}

export interface TrainerMember {
  _id: string;
  trainerId: string;
  memberId: {
    _id: string;
    fullName: string;
    email?: string;
    phone?: string;
    memberCode?: string;
    status: string;
  };
  assignedAt: string;
  status: string;
}

export interface TrainerQueryParams {
  search?: string;
  status?: TrainerStatus;
  sort?: string;
  order?: string;
  page?: number;
  limit?: number;
}
