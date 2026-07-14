import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useGymStore } from '@/store/gym.store';
import {
  MembershipPlan,
  PlanListItem,
  PlanStatus,
  PlansFilters,
  SortDir,
  SortField,
} from '../types';
import { CreatePlanData } from '../schemas/plan.schema';

import { apiClient } from '@/lib/apiClient';

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
      const response = await apiClient.get('/membership-plans', {
        params: {
          includeArchived: 'true',
        }
      });
      const rawPlans = response.data.data;

      // Map to frontend structure
      let results: PlanListItem[] = rawPlans.map((p: any) => {
        let duration = p.durationInDays;
        let durationType: 'days' | 'weeks' | 'months' | 'years' = 'days';
        if (p.durationInDays % 365 === 0) {
          duration = p.durationInDays / 365;
          durationType = 'years';
        } else if (p.durationInDays % 30 === 0) {
          duration = p.durationInDays / 30;
          durationType = 'months';
        } else if (p.durationInDays % 7 === 0) {
          duration = p.durationInDays / 7;
          durationType = 'weeks';
        }

        return {
          id: p._id,
          gymId: p.gymId,
          name: p.name,
          description: p.description || '',
          duration,
          durationType,
          price: p.price,
          joiningFee: 0,
          status: p.active ? 'active' : 'inactive',
          color: p.color || '#3B82F6',
          isDefault: false,
          isPopular: false,
          memberCount: 0,
          featureCount: 0,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        };
      });

      // Filter by search locally (backend search not implemented for plans)
      if (search) {
        const q = search.toLowerCase();
        results = results.filter(
          (p) => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q),
        );
      }

      // Filter by status
      if (filters.status?.length) {
        results = results.filter((p) => filters.status!.includes(p.status));
      }

      // Filter by duration type
      if (filters.durationType?.length) {
        results = results.filter((p) => filters.durationType!.includes(p.durationType));
      }

      // Sort
      results.sort((a, b) => {
        let aVal: string | number = a.createdAt;
        let bVal: string | number = b.createdAt;
        if (sortField === 'name') { aVal = a.name; bVal = b.name; }
        if (sortField === 'price') { aVal = a.price; bVal = b.price; }
        if (sortField === 'duration') { aVal = a.duration; bVal = b.duration; }
        const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return sortDir === 'asc' ? cmp : -cmp;
      });

      const total = results.length;
      const paginated = results.slice((page - 1) * pageSize, page * pageSize);

      return { data: paginated, total, page, pageSize };
    },
    enabled: !!selectedGymId,
    staleTime: 2 * 60 * 1000,
  });
}

// ─── Detail Query ─────────────────────────────────────────────────────────────

export function usePlan(planId: string) {
  const { selectedGymId } = useGymStore();

  return useQuery<MembershipPlan>({
    queryKey: planKeys.detail(selectedGymId ?? '', planId),
    queryFn: async () => {
      const response = await apiClient.get(`/membership-plans/${planId}`);
      const p = response.data.data;
      
      let duration = p.durationInDays;
      let durationType: 'days' | 'weeks' | 'months' | 'years' = 'days';
      if (p.durationInDays % 365 === 0) {
        duration = p.durationInDays / 365;
        durationType = 'years';
      } else if (p.durationInDays % 30 === 0) {
        duration = p.durationInDays / 30;
        durationType = 'months';
      } else if (p.durationInDays % 7 === 0) {
        duration = p.durationInDays / 7;
        durationType = 'weeks';
      }

      return {
        id: p._id,
        gymId: p.gymId,
        name: p.name,
        description: p.description || '',
        duration,
        durationType,
        price: p.price,
        joiningFee: 0,
        status: p.active ? 'active' : 'inactive',
        color: p.color || '#3B82F6',
        isDefault: false,
        isPopular: false,
        memberCount: 0,
        features: [],
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      };
    },
    enabled: !!selectedGymId && !!planId,
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreatePlan() {
  const { selectedGymId } = useGymStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePlanData): Promise<any> => {
      let durationInDays = data.duration;
      if (data.durationType === 'weeks') durationInDays = data.duration * 7;
      if (data.durationType === 'months') durationInDays = data.duration * 30;
      if (data.durationType === 'years') durationInDays = data.duration * 365;

      const response = await apiClient.post('/membership-plans', {
        name: data.name,
        description: data.description,
        price: data.price,
        durationInDays,
        color: data.color || '#3B82F6',
      });
      return response.data.data;
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
    mutationFn: async (data: Partial<CreatePlanData>): Promise<any> => {
      const payload: any = {};
      if (data.name !== undefined) payload.name = data.name;
      if (data.description !== undefined) payload.description = data.description;
      if (data.price !== undefined) payload.price = data.price;
      if (data.color !== undefined) payload.color = data.color;
      
      if (data.duration !== undefined && data.durationType !== undefined) {
        let durationInDays = data.duration;
        if (data.durationType === 'weeks') durationInDays = data.duration * 7;
        if (data.durationType === 'months') durationInDays = data.duration * 30;
        if (data.durationType === 'years') durationInDays = data.duration * 365;
        payload.durationInDays = durationInDays;
      }

      const response = await apiClient.patch(`/membership-plans/${planId}`, payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: planKeys.all(selectedGymId ?? '') });
      queryClient.invalidateQueries({ queryKey: planKeys.detail(selectedGymId ?? '', planId) });
    },
  });
}

export function useArchivePlan(planId: string) {
  const { selectedGymId } = useGymStore();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      await apiClient.delete(`/membership-plans/${planId}`);
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
    mutationFn: async (planId: string): Promise<any> => {
      const response = await apiClient.get(`/membership-plans/${planId}`);
      const src = response.data.data;
      
      const newPlanResponse = await apiClient.post('/membership-plans', {
        name: `${src.name} (Copy)`,
        description: src.description,
        price: src.price,
        durationInDays: src.durationInDays,
        color: src.color,
      });
      return newPlanResponse.data.data;
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
      const response = await apiClient.patch(`/membership-plans/${planId}`, {
        active: status === 'active',
      });
      return response.data.data;
    },
    onSuccess: (_data, { planId }) => {
      queryClient.invalidateQueries({ queryKey: planKeys.all(selectedGymId ?? '') });
      queryClient.invalidateQueries({ queryKey: planKeys.detail(selectedGymId ?? '', planId) });
    },
  });
}
