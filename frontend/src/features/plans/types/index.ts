// ─── Enums ───────────────────────────────────────────────────────────────────

export type DurationType = 'days' | 'weeks' | 'months' | 'years';

export type PlanStatus = 'active' | 'inactive' | 'archived';

// ─── Feature System ───────────────────────────────────────────────────────────

export interface PlanFeature {
  id: string;
  label: string;
  included: boolean;
}

// ─── Core Entity ─────────────────────────────────────────────────────────────

export interface MembershipPlan {
  id: string;
  gymId: string;
  name: string;
  description?: string;
  duration: number;
  durationType: DurationType;
  price: number;
  joiningFee?: number;
  status: PlanStatus;
  features: PlanFeature[];
  /** Optional hex/hsl accent for the plan card (e.g. "#6366f1") */
  color?: string;
  isDefault: boolean;
  isPopular: boolean;
  memberCount?: number;
  createdAt: string;
  updatedAt: string;
}

/** Lightweight list item for directory/table views */
export type PlanListItem = Omit<MembershipPlan, 'features'> & {
  featureCount: number;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

export const DURATION_TYPE_LABELS: Record<DurationType, string> = {
  days: 'Day(s)',
  weeks: 'Week(s)',
  months: 'Month(s)',
  years: 'Year(s)',
};

export const PLAN_STATUS_LABELS: Record<PlanStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  archived: 'Archived',
};

export const DEFAULT_PLAN_FEATURES: Omit<PlanFeature, 'id'>[] = [
  { label: 'Workout Access', included: true },
  { label: 'Personal Trainer', included: false },
  { label: 'Locker Room', included: false },
  { label: 'Diet Plan', included: false },
  { label: 'Group Classes', included: false },
  { label: 'Swimming Pool', included: false },
];

// ─── Form Types ───────────────────────────────────────────────────────────────

export interface CreatePlanStep1Data {
  name: string;
  description?: string;
  color?: string;
}

export interface CreatePlanStep2Data {
  price: number;
  joiningFee?: number;
  isDefault: boolean;
  isPopular: boolean;
}

export interface CreatePlanStep3Data {
  duration: number;
  durationType: DurationType;
}

export interface CreatePlanStep4Data {
  features: PlanFeature[];
}

export type CreatePlanFormData = CreatePlanStep1Data &
  CreatePlanStep2Data &
  CreatePlanStep3Data &
  CreatePlanStep4Data;

// ─── Filters ──────────────────────────────────────────────────────────────────

export interface PlansFilters {
  status: PlanStatus[];
  durationType: DurationType[];
  priceMin?: number;
  priceMax?: number;
  isPopular: boolean;
  isDefault: boolean;
}

export type SortField = 'name' | 'price' | 'duration' | 'createdAt';
export type SortDir = 'asc' | 'desc';
