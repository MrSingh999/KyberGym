import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { useGymStore } from "@/store/gym.store";
import {
  MemberProfile,
  MemberActivity,
  MemberNote,
  PaymentSummaryItem,
  WorkoutSummaryItem,
  RenewMembershipFormData,
  SuspendMemberFormData,
} from "../types/profile";
import { computeDueStatus } from "../types";

// ------ Queries ------

export function useMemberProfile(memberId: string) {
  const { selectedGymId } = useGymStore();

  return useQuery<MemberProfile>({
    queryKey: ["member", selectedGymId, memberId],
    queryFn: async () => {
      const res = await apiClient.get(`/members/${memberId}`);
      const m = res.data.data;
      
      let planName = "No active plan";
      let membershipStartDate = "";
      let membershipEndDate = "";
      let activeSubId = "";
      let subscriptionStatus = "inactive";
      try {
        const subsRes = await apiClient.get('/member-subscriptions', {
          params: { memberId, limit: 1 }
        });
        const activeSub = subsRes.data.data?.[0];
        if (activeSub) {
          planName = activeSub.membershipPlanId?.name || "Pro Monthly";
          membershipStartDate = activeSub.startDate ? new Date(activeSub.startDate).toISOString().split('T')[0] : "";
          membershipEndDate = activeSub.endDate ? new Date(activeSub.endDate).toISOString().split('T')[0] : "";
          activeSubId = activeSub.id || activeSub._id;
          subscriptionStatus = activeSub.status;
        }
      } catch {
        // Fallback silently if subscriptions fail
      }

      return {
        id: m.id || m._id,
        name: m.fullName,
        phone: m.phone || undefined,
        email: m.email || undefined,
        profilePhoto: m.profilePhoto,
        bloodGroup: m.bloodGroup,
        address: m.address,
        gender: m.gender || "male",
        dateOfBirth: m.dateOfBirth ? new Date(m.dateOfBirth).toISOString().split('T')[0] : "",
        joiningDate: m.joinDate ? new Date(m.joinDate).toISOString().split('T')[0] : "",
        membershipStartDate,
        membershipEndDate,
        membershipStatus: m.status === 'active' ? 'Active' : m.status === 'suspended' ? 'Suspended' : 'Inactive',
        dueStatus: m.status === 'active' ? computeDueStatus(membershipEndDate) : undefined,
        planName,
        emergencyContactName: m.emergencyContact?.name,
        emergencyContactPhone: m.emergencyContact?.phone,
        rawNotes: m.notes || "",
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
        activeSubId,
        subscriptionStatus,
      } as MemberProfile;
    },
    enabled: !!selectedGymId && !!memberId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useMemberActivities(memberId: string) {
  const { selectedGymId } = useGymStore();

  return useQuery<MemberActivity[]>({
    queryKey: ["member-activities", selectedGymId, memberId],
    queryFn: async () => {
      const [subs, payments] = await Promise.all([
        (async () => {
          try {
            const res = await apiClient.get('/member-subscriptions', { params: { memberId, limit: 50 } });
            return res.data.data ?? [];
          } catch { return []; }
        })(),
        (async () => {
          try {
            const res = await apiClient.get('/payments', { params: { memberId, limit: 50 } });
            return res.data.data ?? [];
          } catch { return []; }
        })(),
      ]);

      const activities: MemberActivity[] = [];

      subs.forEach((sub: any) => {
        activities.push({
          id: `sub-${sub.id || sub._id}`,
          type: "membership_renewed",
          description: `Subscription to ${sub.membershipPlanId?.name || "Plan"} created (Status: ${sub.status})`,
          createdAt: sub.createdAt,
          actorName: "System",
        });
      });

      payments.forEach((pay: any) => {
        activities.push({
          id: `pay-${pay.id || pay._id}`,
          type: "payment_received",
          description: `Payment of ₹${pay.finalAmount || pay.amount} received (Status: ${pay.status})`,
          createdAt: pay.paymentDate || pay.createdAt,
          actorName: "System",
        });
      });

      // Sort by date desc
      return activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    enabled: !!selectedGymId && !!memberId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useMemberNotes(memberId: string) {
  const { selectedGymId } = useGymStore();

  return useQuery<MemberNote[]>({
    queryKey: ["member-notes", selectedGymId, memberId],
    queryFn: async () => {
      const res = await apiClient.get(`/members/${memberId}`);
      const m = res.data.data;
      if (!m.notes) return [];

      return [
        {
          id: "member-notes-str",
          content: m.notes,
          isPinned: true,
          createdAt: m.updatedAt || m.createdAt,
          updatedAt: m.updatedAt || m.createdAt,
          authorName: "Staff",
        }
      ];
    },
    enabled: !!selectedGymId && !!memberId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useMemberPaymentSummary(memberId: string) {
  const { selectedGymId } = useGymStore();

  return useQuery<PaymentSummaryItem[]>({
    queryKey: ["member-summary", selectedGymId, memberId, "payments"],
    queryFn: async () => {
      let rawPayments: any[] = [];
      try {
        const response = await apiClient.get('/payments', {
          params: { memberId, limit: 50 }
        });
        rawPayments = response.data.data ?? [];
      } catch {
        return [];
      }

      const planIds = [...new Set(rawPayments.map((p: any) => p.planId).filter(Boolean))];
      let planNames = new Map<string, string>();
      if (planIds.length > 0) {
        try {
          const plansRes = await apiClient.get('/membership-plans', { params: { limit: 200 } });
          (plansRes.data.data || []).forEach((pl: any) => {
            planNames.set(pl.id || pl._id, pl.name);
          });
        } catch { /* fallback */ }
      }

      const paymentsWithPlans = rawPayments.map((p: any) => ({
        id: p.id || p._id,
        amount: p.finalAmount || p.amount,
        date: p.paymentDate ? new Date(p.paymentDate).toISOString().split('T')[0] : "",
        status: p.status || "paid",
        description: `${planNames.get(p.planId) || "Gym Membership"} – payment`,
      }));
      return paymentsWithPlans;
    },
    enabled: !!selectedGymId && !!memberId,
  });
}

export function useMemberWorkoutSummary(memberId: string) {
  const { selectedGymId } = useGymStore();

  return useQuery<WorkoutSummaryItem[]>({
    queryKey: ["member-summary", selectedGymId, memberId, "workouts"],
    queryFn: async () => {
      const res = await apiClient.get('/workouts');
      const allWorkouts = res.data.data || [];
      const assigned = allWorkouts.filter((w: any) => 
        w.assignmentType === 'ALL' || 
        (w.assignmentType === 'SELECTED' && w.assignedMembers?.includes(memberId))
      );
      return assigned.map((w: any) => ({
        id: w.id || w._id,
        title: w.title,
        assignedAt: w.createdAt ? new Date(w.createdAt).toISOString().split('T')[0] : "",
        status: w.isActive ? "in_progress" as const : "completed" as const,
      }));
    },
    enabled: !!selectedGymId && !!memberId,
  });
}

// ------ Mutations ------

export function useRenewMembership(memberId: string) {
  const { selectedGymId } = useGymStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RenewMembershipFormData) => {
      // Find active subscriptions first, cancel them to avoid backend Conflict error
      const profile = await queryClient.fetchQuery<MemberProfile>({
        queryKey: ["member", selectedGymId, memberId]
      });

      if (profile?.activeSubId && profile?.subscriptionStatus === 'active') {
        try {
          await apiClient.patch(`/member-subscriptions/${profile.activeSubId}/status`, {
            status: 'cancelled',
            notes: 'Renewed and superseded by new plan'
          });
        } catch {
          // ignore failures if it was already updated
        }
      }

      // 1. Create a subscription (backend auto-creates payment if paymentMethod is provided)
      await apiClient.post('/member-subscriptions', {
        memberId,
        membershipPlanId: data.planId,
        startDate: new Date(data.startDate).toISOString(),
        paymentMethod: data.paymentMethod,
      });
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["member", selectedGymId, memberId] });
      queryClient.invalidateQueries({ queryKey: ["member-activities", selectedGymId, memberId] });
      queryClient.invalidateQueries({ queryKey: ["payments", selectedGymId] });
    },
  });
}

export function useSuspendMember(memberId: string) {
  const { selectedGymId } = useGymStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SuspendMemberFormData) => {
      await apiClient.patch(`/members/${memberId}`, {
        status: 'suspended',
        notes: data.reason,
      });
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["member", selectedGymId, memberId] });
    },
  });
}

export function useActivateMember(memberId: string) {
  const { selectedGymId } = useGymStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await apiClient.patch(`/members/${memberId}`, {
        status: 'active',
      });
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["member", selectedGymId, memberId] });
    },
  });
}

export function useUpdateMemberNotes(memberId: string) {
  const { selectedGymId } = useGymStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notes: string) => {
      await apiClient.patch(`/members/${memberId}`, { notes });
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["member-notes", selectedGymId, memberId] });
      queryClient.invalidateQueries({ queryKey: ["member", selectedGymId, memberId] });
    },
  });
}

export function useFreezeSubscription(memberId: string, subId: string) {
  const { selectedGymId } = useGymStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notes?: string) => {
      await apiClient.patch(`/member-subscriptions/${subId}/status`, {
        status: 'paused',
        notes
      });
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["member", selectedGymId, memberId] });
      queryClient.invalidateQueries({ queryKey: ["member-activities", selectedGymId, memberId] });
    },
  });
}

export function useResumeSubscription(memberId: string, subId: string) {
  const { selectedGymId } = useGymStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await apiClient.patch(`/member-subscriptions/${subId}/status`, {
        status: 'active'
      });
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["member", selectedGymId, memberId] });
      queryClient.invalidateQueries({ queryKey: ["member-activities", selectedGymId, memberId] });
    },
  });
}
