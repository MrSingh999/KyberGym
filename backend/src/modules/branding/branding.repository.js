import { GymBranding } from './models/GymBranding.model.js';

export class BrandingRepository {
  static async upsert(gymId, data) {
    return GymBranding.findOneAndUpdate(
      { gymId },
      { ...data, gymId },
      { new: true, upsert: true }
    );
  }

  static async findByGymId(gymId) {
    return GymBranding.findOne({ gymId });
  }
}
