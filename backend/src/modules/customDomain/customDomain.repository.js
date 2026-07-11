import { CustomDomain } from './models/CustomDomain.model.js';

export class CustomDomainRepository {
  static async create(data) {
    return CustomDomain.create(data);
  }

  static async findByGymId(gymId) {
    return CustomDomain.findOne({ gymId });
  }

  static async update(gymId, updateData) {
    return CustomDomain.findOneAndUpdate({ gymId }, updateData, { new: true });
  }

  static async delete(gymId) {
    return CustomDomain.findOneAndDelete({ gymId });
  }
}
