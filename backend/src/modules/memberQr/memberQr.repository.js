import { MemberQr } from './models/MemberQr.model.js';

export class MemberQrRepository {
  static async upsert(gymId, memberId, qrCodeData, base64Image) {
    return MemberQr.findOneAndUpdate(
      { gymId, memberId },
      { qrCodeData, base64Image, active: true, generatedAt: new Date() },
      { new: true, upsert: true }
    );
  }

  static async findByMemberId(gymId, memberId) {
    return MemberQr.findOne({ gymId, memberId, active: true });
  }

  static async deactivate(gymId, memberId) {
    return MemberQr.findOneAndUpdate(
      { gymId, memberId },
      { active: false },
      { new: true }
    );
  }
}
