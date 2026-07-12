// ─── Enums ────────────────────────────────────────────────────────────────────

export type PaymentMethod = 'cash' | 'upi' | 'card' | 'bank_transfer';

export type PaymentStatus =
  | 'paid'
  | 'pending'
  | 'failed'
  | 'refunded'
  | 'partially_paid';

export type DueCategory = 'overdue' | 'today' | 'in_3_days' | 'in_7_days';

// ─── Core Entity ──────────────────────────────────────────────────────────────

export interface Payment {
  id: string;
  gymId: string;
  memberId: string;
  memberName: string;
  memberCode: string;
  memberPhone?: string;
  planId: string;
  planName: string;
  amount: number;
  discount: number;
  finalAmount: number; // amount - discount, resolved at time of collection
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionReference?: string;
  paymentDate: string;
  membershipStartDate: string;
  membershipEndDate: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

/** Lightweight list item for directory/table */
export type PaymentListItem = Pick<
  Payment,
  | 'id'
  | 'memberId'
  | 'memberName'
  | 'memberCode'
  | 'planName'
  | 'finalAmount'
  | 'paymentMethod'
  | 'paymentStatus'
  | 'paymentDate'
  | 'transactionReference'
>;

// ─── Due Tracking ─────────────────────────────────────────────────────────────

export interface DueEntry {
  memberId: string;
  memberName: string;
  memberCode: string;
  phone: string;
  planName: string;
  membershipEndDate: string;
  /** Positive = days remaining, negative = days overdue */
  daysUntilDue: number;
  category: DueCategory;
}

// ─── Display Helpers ──────────────────────────────────────────────────────────

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Cash',
  upi: 'UPI',
  card: 'Card',
  bank_transfer: 'Bank Transfer',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  paid: 'Paid',
  pending: 'Pending',
  failed: 'Failed',
  refunded: 'Refunded',
  partially_paid: 'Partial',
};

export const DUE_CATEGORY_LABELS: Record<DueCategory, string> = {
  overdue: 'Overdue',
  today: 'Due Today',
  in_3_days: 'Due in 3 Days',
  in_7_days: 'Due in 7 Days',
};

// ─── Filter & Sort Types ──────────────────────────────────────────────────────

export interface PaymentsFilters {
  status: PaymentStatus[];
  method: PaymentMethod[];
  dateFrom?: string;
  dateTo?: string;
  planId?: string;
}

export type PaymentSortField =
  | 'paymentDate'
  | 'finalAmount'
  | 'memberName'
  | 'createdAt';
export type SortDir = 'asc' | 'desc';

// ─── Form Data ────────────────────────────────────────────────────────────────

export interface CollectPaymentStep1Data {
  memberId: string;
  memberName: string;
  memberCode: string;
}

export interface CollectPaymentStep2Data {
  planId: string;
  planName: string;
  membershipStartDate: string;
  membershipEndDate: string;
}

export interface CollectPaymentStep3Data {
  amount: number;
  discount: number;
  finalAmount: number;
  paymentMethod: PaymentMethod;
  transactionReference?: string;
  paymentDate: string;
  notes?: string;
}
