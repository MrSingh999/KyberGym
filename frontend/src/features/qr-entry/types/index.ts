export interface MemberQr {
  id: string;
  gymId: string;
  memberId: string;
  qrCodeData: string;
  base64Image?: string;
  active: boolean;
  generatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QrViewData {
  member: {
    id: string;
    name: string;
    memberCode: string;
    phone?: string;
  };
  qr: MemberQr | null;
}
