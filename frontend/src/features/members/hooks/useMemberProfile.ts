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
      try {
        const subsRes = await apiClient.get('/member-subscriptions', {
          params: { memberId, status: 'active', limit: 1 }
        });
        const activeSub = subsRes.data.data?.[0];
        if (activeSub) {
          const planRes = await apiClient.get(`/membership-plans/${activeSub.membershipPlanId}`);
          planName = planRes.data.data?.name || "Pro Monthly";
          membershipStartDate = activeSub.startDate ? new Date(activeSub.startDate).toISOString().split('T')[0] : "";
          membershipEndDate = activeSub.endDate ? new Date(activeSub.endDate).toISOString().split('T')[0] : "";
        }
      } catch (e) {
        // Fallback silently if subscriptions fail
      }

      return {
        id: m._id,
        memberCode: m.memberCode,
        name: m.fullName,
        phone: m.phone || "No phone",
        email: m.email || "No email",
        profilePhoto: m.profilePhoto,
        gender: m.gender || "male",
        dateOfBirth: m.dateOfBirth ? new Date(m.dateOfBirth).toISOString().split('T')[0] : "",
        joiningDate: m.joinDate ? new Date(m.joinDate).toISOString().split('T')[0] : "",
        membershipStartDate,
        membershipEndDate,
        membershipStatus: m.status === 'active' ? 'Active' : m.status === 'expired' ? 'Expired' : m.status === 'suspended' ? 'Suspended' : 'Inactive',
        planName,
        assignedTrainerName: "Coach Alex",
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
      };
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
      await new Promise((r) => setTimeout(r, 500));
      return [
        { id: "a1", type: "membership_renewed", description: "Membership renewed for 1 year (Pro Plan)", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), actorName: "Gym Owner" },
        { id: "a2", type: "profile_updated", description: "Phone number updated", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), actorName: "Alex Johnson" },
        { id: "a3", type: "member_created", description: "Member account created", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 180).toISOString(), actorName: "Gym Owner" },
      ];
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
      await new Promise((r) => setTimeout(r, 400));
      return [
        { id: "n1", content: "Has a knee injury – avoid lower body exercises without clearance.", isPinned: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), updatedAt: new Date().toISOString(), authorName: "Coach Priya" },
        { id: "n2", content: "Prefers morning sessions. Interested in upgrading to Elite plan.", isPinned: false, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), updatedAt: new Date().toISOString(), authorName: "Gym Owner" },
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
      const response = await apiClient.get('/payments', {
        params: { memberId, limit: 50 }
      });
      const rawPayments = response.data.data;
      
      const paymentsWithPlans = await Promise.all(
        rawPayments.map(async (p: any) => {
          let planName = "Gym Membership";
          if (p.planId) {
            try {
              const planRes = await apiClient.get(`/membership-plans/${p.planId}`);
              planName = planRes.data.data?.name || "Gym Membership";
            } catch {
              // fallback
            }
          }
          return {
            id: p._id,
            amount: p.finalAmount || p.amount,
            date: p.paymentDate ? new Date(p.paymentDate).toISOString().split('T')[0] : "",
            status: p.status || "paid",
            description: `${planName} – payment`,
          };
        })
      );
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
      await new Promise((r) => setTimeout(r, 400));
      return [
        { id: "w1", title: "Hypertrophy Phase 1", assignedAt: "2024-06-01", status: "in_progress" },
      ];
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
      // 1. Create a subscription
      await apiClient.post('/member-subscriptions', {
        memberId,
        membershipPlanId: data.planId,
        startDate: new Date(data.startDate).toISOString(),
      });
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["member", selectedGymId, memberId] });
      queryClient.invalidateQueries({ queryKey: ["member-activities", selectedGymId, memberId] });
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
