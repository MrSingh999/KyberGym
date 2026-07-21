import mongoose from 'mongoose';
import { GymSubscription } from './models/GymSubscription.model.js';

export class GymSubscriptionRepository {
  static async findByGymId(gymId) {
    const id = mongoose.Types.ObjectId.isValid(gymId)
      ? new mongoose.Types.ObjectId(gymId)
      : gymId;
    return GymSubscription.findOne({ gymId: id });
  }

  static async findByGymIds(gymIds) {
    const ids = gymIds.map(id =>
      mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id
    );
    return GymSubscription.find({ gymId: { $in: ids } }).lean();
  }

  static async findOrCreate(gymId) {
    let sub = await GymSubscription.findOne({ gymId });
    if (!sub) {
      sub = await GymSubscription.create({ gymId });
    }
    return sub;
  }

  static async upsert(gymId, data, options = {}) {
    const id = mongoose.Types.ObjectId.isValid(gymId)
      ? new mongoose.Types.ObjectId(gymId)
      : gymId;
    const queryOptions = { upsert: true, new: true, runValidators: true };
    if (options.session) queryOptions.session = options.session;
    return GymSubscription.findOneAndUpdate(
      { gymId: id },
      { $set: data },
      queryOptions
    );
  }

  static async updateByGymId(gymId, updateData, options = {}) {
    const id = mongoose.Types.ObjectId.isValid(gymId)
      ? new mongoose.Types.ObjectId(gymId)
      : gymId;
    const queryOptions = { new: true, runValidators: true };
    if (options.session) queryOptions.session = options.session;
    return GymSubscription.findOneAndUpdate(
      { gymId: id },
      { $set: updateData },
      queryOptions
    );
  }

  static async countByStatus(status) {
    return GymSubscription.countDocuments({ status });
  }

  static async findGymIdsByStatus(status) {
    const subs = await GymSubscription.find({ status }).select('gymId').lean();
    return subs.map(s => s.gymId);
  }

  static async deleteByGymId(gymId) {
    return GymSubscription.findOneAndDelete({ gymId });
  }
}
