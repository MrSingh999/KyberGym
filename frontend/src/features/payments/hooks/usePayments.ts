import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useGymStore } from '@/store/gym.store';
import {
  Payment,
  PaymentListItem,
  PaymentsFilters,
  PaymentSortField,
  SortDir,
  DueEntry,
  PaymentStatus,
} from '../types';
import { CollectPaymentData } from '../schemas/payment.schema';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_PAYMENTS: Payment[] = [
  {
    id: 'pay-001', gymId: 'gym-1', memberId: 'mem-1',
    memberName: 'Alex Johnson', memberCode: 'KGM-1042', memberPhone: '+1 555-123-4567',
    planId: 'plan-2', planName: 'Pro Quarterly',
    amount: 99, discount: 0, finalAmount: 99,
    paymentMethod: 'upi', paymentStatus: 'paid',
    transactionReference: 'UPI-20240601-ABC123',
    paymentDate: '2024-06-01', membershipStartDate: '2024-06-01', membershipEndDate: '2024-09-01',
    createdBy: 'Owner', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'pay-002', gymId: 'gym-1', memberId: 'mem-2',
    memberName: 'Sara Williams', memberCode: 'KGM-1043', memberPhone: '+1 555-987-6543',
    planId: 'plan-3', planName: 'Elite Annual',
    amount: 349, discount: 50, finalAmount: 299,
    paymentMethod: 'card', paymentStatus: 'paid',
    transactionReference: 'TXN-20240601-XYZ789',
    paymentDate: '2024-06-01', membershipStartDate: '2024-06-01', membershipEndDate: '2025-06-01',
    createdBy: 'Owner', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'pay-003', gymId: 'gym-1', memberId: 'mem-3',
    memberName: 'Marcus Chen', memberCode: 'KGM-1044', memberPhone: '+1 555-246-8101',
    planId: 'plan-1', planName: 'Starter Monthly',
    amount: 39, discount: 0, finalAmount: 39,
    paymentMethod: 'cash', paymentStatus: 'pending',
    paymentDate: '2024-06-10', membershipStartDate: '2024-06-10', membershipEndDate: '2024-07-10',
    createdBy: 'Owner', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'pay-004', gymId: 'gym-1', memberId: 'mem-4',
    memberName: 'Priya Sharma', memberCode: 'KGM-1045', memberPhone: '+91 98765-43210',
    planId: 'plan-2', planName: 'Pro Quarterly',
    amount: 99, discount: 10, finalAmount: 89,
    paymentMethod: 'upi', paymentStatus: 'paid',
    transactionReference: 'UPI-20240505-DEF456',
    paymentDate: '2024-05-05', membershipStartDate: '2024-05-05', membershipEndDate: '2024-08-05',
    notes: 'Renewed early — gave loyalty discount.',
    createdBy: 'Owner', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 40).toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'pay-005', gymId: 'gym-1', memberId: 'mem-5',
    memberName: 'Jake Thompson', memberCode: 'KGM-1046', memberPhone: '+1 555-369-2580',
    planId: 'plan-1', planName: 'Starter Monthly',
    amount: 39, discount: 0, finalAmount: 39,
    paymentMethod: 'bank_transfer', paymentStatus: 'failed',
    transactionReference: 'BNK-20240612-GHI012',
    paymentDate: '2024-06-12', membershipStartDate: '2024-06-12', membershipEndDate: '2024-07-12',
    createdBy: 'Owner', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'pay-006', gymId: 'gym-1', memberId: 'mem-6',
    memberName: 'Nadia Patel', memberCode: 'KGM-1047',
    planId: 'plan-3', planName: 'Elite Annual',
    amount: 349, discount: 0, finalAmount: 349,
    paymentMethod: 'card', paymentStatus: 'refunded',
    transactionReference: 'TXN-20240401-REF111',
    paymentDate: '2024-04-01', membershipStartDate: '2024-04-01', membershipEndDate: '2025-04-01',
    notes: 'Refund requested due to medical leave.',
    createdBy: 'Owner', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 70).toISOString(), updatedAt: new Date().toISOString(),
  },
];

const MOCK_DUES: DueEntry[] = [
  { memberId: 'mem-7', memberName: 'Ryan Foster', memberCode: 'KGM-1048', phone: '+1 555-111-2222', planName: 'Starter Monthly', membershipEndDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString().split('T')[0], daysUntilDue: -3, category: 'overdue' },
  { memberId: 'mem-8', memberName: 'Lena Kim', memberCode: 'KGM-1049', phone: '+82 10-1234-5678', planName: 'Pro Quarterly', membershipEndDate: new Date().toISOString().split('T')[0], daysUntilDue: 0, category: 'today' },
  { memberId: 'mem-9', memberName: 'Diego Reyes', memberCode: 'KGM-1050', phone: '+1 555-333-4444', planName: 'Elite Annual', membershipEndDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString().split('T')[0], daysUntilDue: 2, category: 'in_3_days' },
  { memberId: 'mem-10', memberName: 'Aisha Okafor', memberCode: 'KGM-1051', phone: '+234 802-345-6789', planName: 'Starter Monthly', membershipEndDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 6).toISOString().split('T')[0], daysUntilDue: 6, category: 'in_7_days' },
];

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const paymentKeys = {
  all: (gymId: string) => ['payments', gymId] as const,
  list: (gymId: string, params: object) => ['payments', gymId, params] as const,
  detail: (gymId: string, paymentId: string) => ['payment', gymId, paymentId] as const,
  memberHistory: (gymId: string, memberId: string) => ['member-payments', gymId, memberId] as const,
  dues: (gymId: string) => ['payment-dues', gymId] as const,
};

// ─── List Query ───────────────────────────────────────────────────────────────

interface UsePaymentsParams {
  search?: string;
  filters?: Partial<PaymentsFilters>;
  sortField?: PaymentSortField;
  sortDir?: SortDir;
  page?: number;
  pageSize?: number;
}

export function usePayments(params: UsePaymentsParams = {}) {
  const { selectedGymId } = useGymStore();
  const { search = '', filters = {}, sortField = 'paymentDate', sortDir = 'desc', page = 1, pageSize = 20 } = params;

  return useQuery({
    queryKey: paymentKeys.list(selectedGymId ?? '', { search, filters, sortField, sortDir, page }),
    queryFn: async (): Promise<{ data: PaymentListItem[]; total: number }> => {
      await new Promise((r) => setTimeout(r, 450));

      let results = MOCK_PAYMENTS.filter((p) => p.gymId === (selectedGymId ?? 'gym-1'));

      if (search) {
        const q = search.toLowerCase();
        results = results.filter(
          (p) =>
            p.memberName.toLowerCase().includes(q) ||
            p.memberCode.toLowerCase().includes(q) ||
            p.memberPhone?.includes(q) ||
            p.transactionReference?.toLowerCase().includes(q),
        );
      }
      if (filters.status?.length) {
        results = results.filter((p) => filters.status!.includes(p.paymentStatus));
      }
      if (filters.method?.length) {
        results = results.filter((p) => filters.method!.includes(p.paymentMethod));
      }
      if (filters.dateFrom) {
        results = results.filter((p) => p.paymentDate >= filters.dateFrom!);
      }
      if (filters.dateTo) {
        results = results.filter((p) => p.paymentDate <= filters.dateTo!);
      }

      results.sort((a, b) => {
        let aVal: string | number = a.paymentDate;
        let bVal: string | number = b.paymentDate;
        if (sortField === 'finalAmount') { aVal = a.finalAmount; bVal = b.finalAmount; }
        if (sortField === 'memberName') { aVal = a.memberName; bVal = b.memberName; }
        if (sortField === 'createdAt') { aVal = a.createdAt; bVal = b.createdAt; }
        const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return sortDir === 'asc' ? cmp : -cmp;
      });

      const listItems: PaymentListItem[] = results.map((p) => ({
        id: p.id, memberId: p.memberId, memberName: p.memberName, memberCode: p.memberCode,
        planName: p.planName, finalAmount: p.finalAmount, paymentMethod: p.paymentMethod,
        paymentStatus: p.paymentStatus, paymentDate: p.paymentDate, transactionReference: p.transactionReference,
      }));

      return {
        data: listItems.slice((page - 1) * pageSize, page * pageSize),
        total: listItems.length,
      };
    },
    staleTime: 2 * 60 * 1000,
  });
}

// ─── Detail Query ─────────────────────────────────────────────────────────────

export function usePayment(paymentId: string) {
  const { selectedGymId } = useGymStore();
  return useQuery<Payment>({
    queryKey: paymentKeys.detail(selectedGymId ?? '', paymentId),
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 350));
      const p = MOCK_PAYMENTS.find((p) => p.id === paymentId);
      if (!p) throw new Error('Payment not found');
      return p;
    },
    enabled: !!paymentId,
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Member Payment History ───────────────────────────────────────────────────

export function useMemberPayments(memberId: string) {
  const { selectedGymId } = useGymStore();
  return useQuery<Payment[]>({
    queryKey: paymentKeys.memberHistory(selectedGymId ?? '', memberId),
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 350));
      return MOCK_PAYMENTS.filter((p) => p.memberId === memberId);
    },
    enabled: !!memberId,
    staleTime: 2 * 60 * 1000,
  });
}

// ─── Due Entries Query ────────────────────────────────────────────────────────

export function usePaymentDues() {
  const { selectedGymId } = useGymStore();
  return useQuery<DueEntry[]>({
    queryKey: paymentKeys.dues(selectedGymId ?? ''),
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 300));
      return MOCK_DUES;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCollectPayment() {
  const { selectedGymId } = useGymStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CollectPaymentData): Promise<Payment> => {
      // await apiClient.post('/payments', { ...data, gymId: selectedGymId });
      await new Promise((r) => setTimeout(r, 1000));
      return {
        ...data,
        id: `pay-${Date.now()}`,
        gymId: selectedGymId ?? '',
        memberCode: data.memberCode,
        memberPhone: undefined,
        createdBy: 'Owner',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.all(selectedGymId ?? '') });
    },
  });
}

export function useUpdatePaymentStatus() {
  const { selectedGymId } = useGymStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ paymentId, status }: { paymentId: string; status: PaymentStatus }) => {
      await new Promise((r) => setTimeout(r, 500));
      return { paymentId, status };
    },
    onSuccess: (_data, { paymentId }) => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.all(selectedGymId ?? '') });
      queryClient.invalidateQueries({ queryKey: paymentKeys.detail(selectedGymId ?? '', paymentId) });
    },
  });
}
