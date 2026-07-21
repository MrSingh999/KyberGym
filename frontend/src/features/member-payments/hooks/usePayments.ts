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

import { apiClient } from '@/lib/apiClient';

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
      const response = await apiClient.get('/member-payments', {
        params: {
          page,
          limit: pageSize,
          status: filters.status?.[0] || undefined,
          paymentMethod: filters.method?.[0] || undefined,
        }
      });
      const rawPayments = response.data.data;
      const meta = response.data.meta;

      const planIds = [...new Set(rawPayments.map((p: any) => p.subscriptionId?.membershipPlanId).filter(Boolean))];
      let planNames = new Map<string, string>();
      if (planIds.length > 0) {
        try {
          const plansRes = await apiClient.get('/membership-plans', { params: { limit: 200 } });
          (plansRes.data.data || []).forEach((pl: any) => planNames.set(pl.id || pl._id, pl.name));
        } catch { /* fallback */ }
      }

      let results: PaymentListItem[] = rawPayments.map((p: any) => ({
        id: p.id || p._id,
        memberId: p.memberId?.id || p.memberId?._id || "",
        memberName: p.memberId?.fullName || "Unknown Member",
        planName: p.paymentFor?.planName || planNames.get(p.subscriptionId?.membershipPlanId) || "Gym Membership",
        finalAmount: p.finalAmount ?? p.amount,
        paymentMethod: p.paymentMethod,
        paymentStatus: p.status === 'completed' ? 'paid' : p.status,
        paymentDate: p.paymentDate ? new Date(p.paymentDate).toISOString().split('T')[0] : "",
        transactionReference: p.transactionId || "",
      }));

      if (search) {
        const q = search.toLowerCase();
        results = results.filter(
          (p) =>
            p.memberName.toLowerCase().includes(q) ||
            p.transactionReference?.toLowerCase().includes(q)
        );
      }

      return {
        data: results,
        total: meta.total,
      };
    },
    enabled: !!selectedGymId,
    staleTime: 2 * 60 * 1000,
  });
}

// ─── Detail Query ─────────────────────────────────────────────────────────────

export function usePayment(paymentId: string) {
  const { selectedGymId } = useGymStore();
  return useQuery<Payment>({
    queryKey: paymentKeys.detail(selectedGymId ?? '', paymentId),
    queryFn: async () => {
      const response = await apiClient.get(`/member-payments/${paymentId}`);
      const p = response.data.data;

      const planId = p.paymentFor?.planId?._id || p.paymentFor?.planId || p.subscriptionId?.membershipPlanId || "";
      const planName = p.paymentFor?.planName || "Gym Membership";

      return {
        id: p.id || p._id,
        gymId: p.gymId,
        memberId: p.memberId?.id || p.memberId?._id || "",
        memberName: p.memberId?.fullName || "Unknown Member",
        memberPhone: "",
        planId,
        planName,
        amount: p.amount,
        discount: p.discount ?? 0,
        finalAmount: p.finalAmount ?? p.amount,
        paymentMethod: p.paymentMethod,
        paymentStatus: p.status === 'completed' ? 'paid' : p.status,
        transactionReference: p.transactionId || "",
        paymentDate: p.paymentDate ? new Date(p.paymentDate).toISOString().split('T')[0] : "",
        membershipStartDate: p.paymentFor?.startDate
          ? new Date(p.paymentFor.startDate).toISOString().split('T')[0]
          : p.subscriptionId?.startDate
          ? new Date(p.subscriptionId.startDate).toISOString().split('T')[0]
          : "",
        membershipEndDate: p.paymentFor?.endDate
          ? new Date(p.paymentFor.endDate).toISOString().split('T')[0]
          : p.subscriptionId?.endDate
          ? new Date(p.subscriptionId.endDate).toISOString().split('T')[0]
          : "",
        createdBy: "Staff",
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      };
    },
    enabled: !!selectedGymId && !!paymentId,
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Member Payment History ───────────────────────────────────────────────────

export function useMemberPayments(memberId: string) {
  const { selectedGymId } = useGymStore();
  return useQuery<Payment[]>({
    queryKey: paymentKeys.memberHistory(selectedGymId ?? '', memberId),
    queryFn: async () => {
      const response = await apiClient.get('/member-payments', {
        params: { memberId, limit: 100 }
      });
      const rawPayments = response.data.data;

      return rawPayments.map((p: any) => ({
        id: p.id || p._id,
        gymId: p.gymId,
        memberId: p.memberId?.id || p.memberId?._id || "",
        memberName: p.memberId?.fullName || "",
        planName: p.paymentFor?.planName || "Gym Membership",
        amount: p.amount,
        discount: p.discount ?? 0,
        finalAmount: p.finalAmount ?? p.amount,
        paymentMethod: p.paymentMethod,
        paymentStatus: p.status === 'completed' ? 'paid' : p.status,
        transactionReference: p.transactionId || "",
        paymentDate: p.paymentDate ? new Date(p.paymentDate).toISOString().split('T')[0] : "",
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      }));
    },
    enabled: !!selectedGymId && !!memberId,
    staleTime: 2 * 60 * 1000,
  });
}

// ─── Due Entries Query ────────────────────────────────────────────────────────

export function usePaymentDues() {
  const { selectedGymId } = useGymStore();
  return useQuery<DueEntry[]>({
    queryKey: paymentKeys.dues(selectedGymId ?? ''),
    queryFn: async () => {
      const response = await apiClient.get('/dashboard/due-tracking');
      const d = response.data.data;
      const list: DueEntry[] = [];
      
      d.dueToday?.forEach((m: any) => {
        list.push({
          memberId: m.memberId?.id || m.memberId?._id || m.id || m._id,
          memberName: m.memberId?.fullName || "Member",
          phone: m.memberId?.phone || "",
          planName: "Gym Member",
          membershipEndDate: m.endDate ? new Date(m.endDate).toISOString().split('T')[0] : "",
          daysUntilDue: 0,
          category: 'today'
        });
      });
      
      d.dueIn3Days?.forEach((m: any) => {
        list.push({
          memberId: m.memberId?.id || m.memberId?._id || m.id || m._id,
          memberName: m.memberId?.fullName || "Member",
          phone: m.memberId?.phone || "",
          planName: "Gym Member",
          membershipEndDate: m.endDate ? new Date(m.endDate).toISOString().split('T')[0] : "",
          daysUntilDue: 3,
          category: 'in_3_days'
        });
      });

      d.dueIn7Days?.forEach((m: any) => {
        list.push({
          memberId: m.memberId?.id || m.memberId?._id || m.id || m._id,
          memberName: m.memberId?.fullName || "Member",
          phone: m.memberId?.phone || "",
          planName: "Gym Member",
          membershipEndDate: m.endDate ? new Date(m.endDate).toISOString().split('T')[0] : "",
          daysUntilDue: 7,
          category: 'in_7_days'
        });
      });

      return list;
    },
    enabled: !!selectedGymId,
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCollectPayment() {
  const { selectedGymId } = useGymStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CollectPaymentData): Promise<any> => {
      let subscriptionId: string | undefined = undefined;
      try {
        const subRes = await apiClient.get('/member-subscriptions', {
          params: { memberId: data.memberId, status: 'active', limit: 1 }
        });
        subscriptionId = subRes.data.data?.[0]?.id || subRes.data.data?.[0]?._id;
      } catch (err: any) {
        console.error('Failed to look up active subscription:', err);
        throw new Error(err?.response?.data?.message || 'Failed to verify active membership subscription. Payment has not been recorded to prevent inconsistency.');
      }

      const response = await apiClient.post('/member-payments', {
        memberId: data.memberId,
        subscriptionId,
        amount: data.amount,
        discount: data.discount || 0,
        finalAmount: data.finalAmount || data.amount,
        paymentMethod: data.paymentMethod,
        transactionId: data.transactionReference || undefined,
        notes: data.notes || undefined,
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.all(selectedGymId ?? '') });
      queryClient.invalidateQueries({ queryKey: ["member-summary", selectedGymId] });
    },
  });
}

export function useRefundPayment() {
  const { selectedGymId } = useGymStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ paymentId, notes }: { paymentId: string; notes?: string }) => {
      const response = await apiClient.post(`/member-payments/${paymentId}/refund`, {
        notes: notes || "Refunded via dashboard"
      });
      return response.data.data;
    },
    onSuccess: (_data, { paymentId }) => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.all(selectedGymId ?? '') });
      queryClient.invalidateQueries({ queryKey: paymentKeys.detail(selectedGymId ?? '', paymentId) });
      queryClient.invalidateQueries({ queryKey: ["member-summary", selectedGymId] });
    },
  });
}
