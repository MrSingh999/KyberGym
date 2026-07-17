import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { useAuthStore } from "@/store/auth.store";
import type { MemberQr } from "../types";

export const myQrKeys = {
  self: ["my-qr"] as const,
};

export function useMyQr() {
  const { user } = useAuthStore();

  return useQuery<MemberQr | null>({
    queryKey: myQrKeys.self,
    queryFn: async () => {
      const response = await apiClient.get("/members/me/qr");
      const qr = response.data.data;
      if (!qr) return null;
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
    enabled: user?.role === "member",
    retry: false,
    staleTime: 60 * 1000,
  });
}
