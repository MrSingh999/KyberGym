import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../../lib/apiClient";
import { useGymStore } from "../../../../store/gym.store";
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
      // const res = await apiClient.get(`/members/${memberId}`, { params: { gymId: selectedGymId } });
      // return res.data;
      await new Promise((r) => setTimeout(r, 600));
      return {
        id: memberId,
        memberCode: "KGM-1042",
        name: "Alex Johnson",
        phone: "+1 (555) 123-4567",
        email: "alex.johnson@example.com",
        profilePhoto: undefined,
        gender: "male",
        dateOfBirth: "1992-08-15",
        joiningDate: "2023-01-10",
        membershipStartDate: "2024-06-01",
        membershipEndDate: "2025-06-01",
        membershipStatus: "Active",
        planName: "Pro Monthly",
        assignedTrainerName: "Coach Priya",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
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
      await new Promise((r) => setTimeout(r, 400));
      return [
        { id: "p1", amount: 120, date: "2024-06-01", status: "paid", description: "Pro Monthly – June" },
        { id: "p2", amount: 120, date: "2024-05-01", status: "paid", description: "Pro Monthly – May" },
      ];
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
      // await apiClient.post(`/members/${memberId}/renew`, { ...data, gymId: selectedGymId });
      await new Promise((r) => setTimeout(r, 800));
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
      // await apiClient.post(`/members/${memberId}/suspend`, { ...data, gymId: selectedGymId });
      await new Promise((r) => setTimeout(r, 600));
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
      // await apiClient.post(`/members/${memberId}/activate`, { gymId: selectedGymId });
      await new Promise((r) => setTimeout(r, 600));
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["member", selectedGymId, memberId] });
    },
  });
}
