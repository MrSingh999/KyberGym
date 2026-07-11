import { BrandingRepository } from './branding.repository.js';

export class BrandingService {
  static async getBranding(gymId) {
    let branding = await BrandingRepository.findByGymId(gymId);
    if (!branding) {
      // Create defaults if they don't exist
      branding = await BrandingRepository.upsert(gymId, {});
    }
    return branding;
  }

  static async updateBranding(gymId, data) {
    return BrandingRepository.upsert(gymId, data);
  }
}
