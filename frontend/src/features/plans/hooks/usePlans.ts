import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useGymStore } from '../../../../store/gym.store';
import {
  MembershipPlan,
  PlanListItem,
  PlanStatus,
  PlansFilters,
  SortDir,
  SortField,
} from '../types';
import { CreatePlanData } from '../schemas/plan.schema';

// ─── Mock data ───────────────────────────────────────────────────────────────

const MOCK_PLANS: MembershipPlan[] = [
  {
    id: 'plan-1',
    gymId: 'gym-1',
    name: 'Starter Monthly',
    description: 'Perfect for beginners getting into fitness.',
    duration: 1,
    durationType: 'months',
    price: 39,
    joiningFee: 0,
    status: 'active',
    features: [
      { id: 'f1', label: 'Workout Access', included: true },
      { id: 'f2', label: 'Personal Trainer', included: false },
      { id: 'f3', label: 'Locker Room', included: true },
      { id: 'f4', label: 'Diet Plan', included: false },
      { id: 'f5', label: 'Group Classes', included: false },
    ],
    color: '#22c55e',
    isDefault: true,
    isPopular: false,
    memberCount: 42,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'plan-2',
    gymId: 'gym-1',
    name: 'Pro Quarterly',
    description: 'Great value for serious gym-goers.',
    duration: 3,
    durationType: 'months',
    price: 99,
    joiningFee: 15,
    status: 'active',
    features: [
      { id: 'f1', label: 'Workout Access', included: true },
      { id: 'f2', label: 'Personal Trainer', included: true },
      { id: 'f3', label: 'Locker Room', included: true },
      { id: 'f4', label: 'Diet Plan', included: false },
      { id: 'f5', label: 'Group Classes', included: true },
    ],
    color: '#6366f1',
    isDefault: false,
    isPopular: true,
    memberCount: 128,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'plan-3',
    gymId: 'gym-1',
    name: 'Elite Annual',
    description: 'Everything included. Unlimited access.',
    duration: 1,
    durationType: 'years',
    price: 349,
    joiningFee: 0,
    status: 'active',
    features: [
      { id: 'f1', label: 'Workout Access', included: true },
      { id: 'f2', label: 'Personal Trainer', included: true },
      { id: 'f3', label: 'Locker Room', included: true },
      { id: 'f4', label: 'Diet Plan', included: true },
      { id: 'f5', label: 'Group Classes', included: true },
      { id: 'f6', label: 'Swimming Pool', included: true },
    ],
    color: '#f59e0b',
    isDefault: false,
    isPopular: true,
    memberCount: 67,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'plan-4',
    gymId: 'gym-1',
    name: 'Student Discount',
    description: 'Special rate for students with valid ID.',
    duration: 1,
    durationType: 'months',
    price: 25,
    joiningFee: 0,
    status: 'inactive',
    features: [
      { id: 'f1', label: 'Workout Access', included: true },
      { id: 'f3', label: 'Locker Room', included: false },
    ],
    isDefault: false,
    isPopular: false,
    memberCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 120).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const planKeys = {
  all: (gymId: string) => ['plans', gymId] as const,
  list: (gymId: string, params: object) => ['plans', gymId, params] as const,
  detail: (gymId: string, planId: string) => ['plan', gymId, planId] as const,
};

// ─── List Query ───────────────────────────────────────────────────────────────

interface UsePlansParams {
  search?: string;
  filters?: Partial<PlansFilters>;
  sortField?: SortField;
  sortDir?: SortDir;
  page?: number;
  pageSize?: number;
}

export function usePlans(params: UsePlansParams = {}) {
  const { selectedGymId } = useGymStore();
  const { search = '', filters = {}, sortField = 'createdAt', sortDir = 'desc', page = 1, pageSize = 12 } = params;

  return useQuery({
    queryKey: planKeys.list(selectedGymId ?? '', { search, filters, sortField, sortDir, page, pageSize }),
    queryFn: async (): Promise<{ data: PlanListItem[]; total: number; page: number; pageSize: number }> => {
      await new Promise((r) => setTimeout(r, 500));

      let results = MOCK_PLANS.filter((p) => p.gymId === (selectedGymId ?? 'gym-1'));

      // Search filtering
      if (search) {
        const q = search.toLowerCase();
        results = results.filter(
          (p) => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q),
        );
      }

      // Status filter
      if (filters.status?.length) {
        results = results.filter((p) => filters.status!.includes(p.status));
      }

      // Duration type filter
      if (filters.durationType?.length) {
        results = results.filter((p) => filters.durationType!.includes(p.durationType));
      }

      // Popular filter
      if (filters.isPopular) {
        results = results.filter((p) => p.isPopular);
      }

      // Default filter
      if (filters.isDefault) {
        results = results.filter((p) => p.isDefault);
      }

      // Sorting
      results.sort((a, b) => {
        let aVal: string | number = a.createdAt;
        let bVal: string | number = b.createdAt;
        if (sortField === 'name') { aVal = a.name; bVal = b.name; }
        if (sortField === 'price') { aVal = a.price; bVal = b.price; }
        if (sortField === 'duration') { aVal = a.duration; bVal = b.duration; }
        const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return sortDir === 'asc' ? cmp : -cmp;
      });

      const listItems: PlanListItem[] = results.map(({ features, ...rest }) => ({
        ...rest,
        featureCount: features.filter((f) => f.included).length,
      }));

      // Pagination
      const total = listItems.length;
      const paginated = listItems.slice((page - 1) * pageSize, page * pageSize);

      return { data: paginated, total, page, pageSize };
    },
    enabled: true,
    staleTime: 2 * 60 * 1000,
  });
}

// ─── Detail Query ─────────────────────────────────────────────────────────────

export function usePlan(planId: string) {
  const { selectedGymId } = useGymStore();

  return useQuery<MembershipPlan>({
    queryKey: planKeys.detail(selectedGymId ?? '', planId),
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 400));
      const plan = MOCK_PLANS.find((p) => p.id === planId);
      if (!plan) throw new Error('Plan not found');
      return plan;
    },
    enabled: !!planId,
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreatePlan() {
  const { selectedGymId } = useGymStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePlanData): Promise<MembershipPlan> => {
      // await apiClient.post('/membership-plans', { ...data, gymId: selectedGymId });
      await new Promise((r) => setTimeout(r, 900));
      return { ...data, id: `plan-${Date.now()}`, gymId: selectedGymId ?? '', memberCount: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: planKeys.all(selectedGymId ?? '') });
    },
  });
}

export function useUpdatePlan(planId: string) {
  const { selectedGymId } = useGymStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<CreatePlanData>): Promise<MembershipPlan> => {
      // await apiClient.patch(`/membership-plans/${planId}`, { ...data, gymId: selectedGymId });
      await new Promise((r) => setTimeout(r, 700));
      const existing = MOCK_PLANS.find((p) => p.id === planId)!;
      return { ...existing, ...data, updatedAt: new Date().toISOString() };
    },
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: planKeys.detail(selectedGymId ?? '', planId) });
      const previous = queryClient.getQueryData<MembershipPlan>(planKeys.detail(selectedGymId ?? '', planId));
      if (previous) {
        queryClient.setQueryData(planKeys.detail(selectedGymId ?? '', planId), { ...previous, ...data });
      }
      return { previous };
    },
    onError: (_err, _data, context) => {
      if (context?.previous) {
        queryClient.setQueryData(planKeys.detail(selectedGymId ?? '', planId), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: planKeys.all(selectedGymId ?? '') });
    },
  });
}

export function useArchivePlan(planId: string) {
  const { selectedGymId } = useGymStore();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await new Promise((r) => setTimeout(r, 500));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: planKeys.all(selectedGymId ?? '') });
    },
  });
}

export function useDuplicatePlan() {
  const { selectedGymId } = useGymStore();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (planId: string): Promise<MembershipPlan> => {
      await new Promise((r) => setTimeout(r, 700));
      const src = MOCK_PLANS.find((p) => p.id === planId)!;
      return { ...src, id: `plan-${Date.now()}`, name: `${src.name} (Copy)`, status: 'inactive', memberCount: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: planKeys.all(selectedGymId ?? '') });
    },
  });
}

export function useSetPlanStatus() {
  const { selectedGymId } = useGymStore();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ planId, status }: { planId: string; status: PlanStatus }) => {
      await new Promise((r) => setTimeout(r, 500));
      return { planId, status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: planKeys.all(selectedGymId ?? '') });
    },
  });
}
