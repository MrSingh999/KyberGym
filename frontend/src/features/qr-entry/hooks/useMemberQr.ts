import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useGymStore } from "@/store/gym.store";
import { apiClient } from "@/lib/apiClient";
import { MemberQr } from "../types";

export const qrKeys = {
  all: (gymId: string) => ["qr", gymId] as const,
  member: (gymId: string, memberId: string) => ["qr", gymId, memberId] as const,
};

export function useMemberQr(memberId: string) {
  const { selectedGymId } = useGymStore();

  return useQuery<MemberQr>({
    queryKey: qrKeys.member(selectedGymId ?? "", memberId),
    queryFn: async () => {
      const response = await apiClient.get(`/members/${memberId}/qr`);
      const qr = response.data.data;
      return {
        id: qr.id || qr._id,
        gymId: qr.gymId,
        memberId: qr.memberId,
        qrCodeData: qr.qrCodeData,
        base64Image: qr.base64Image,
        active: qr.active ?? true,
        generatedAt: qr.generatedAt,
        createdAt: qr.createdAt,
        updatedAt: qr.updatedAt,
      };
    },
    enabled: !!selectedGymId && !!memberId,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useGenerateQr(memberId: string) {
  const { selectedGymId } = useGymStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post(`/members/${memberId}/qr`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qrKeys.member(selectedGymId ?? "", memberId) });
    },
  });
}

export function useRegenerateQr(memberId: string) {
  const { selectedGymId } = useGymStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.patch(`/members/${memberId}/qr/regenerate`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qrKeys.member(selectedGymId ?? "", memberId) });
    },
  });
}
