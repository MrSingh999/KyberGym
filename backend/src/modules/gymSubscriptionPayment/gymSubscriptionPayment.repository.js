import { GymSubscriptionPayment } from './models/GymSubscriptionPayment.model.js';

export class GymSubscriptionPaymentRepository {
  static async create(data) {
    return GymSubscriptionPayment.create(data);
  }

  static async findByPublicId(publicId) {
    return GymSubscriptionPayment.findOne({ publicId })
      .populate('gymId', 'name publicId slug')
      .populate('receivedBy', 'fullName email')
      .populate('refundedBy', 'fullName email');
  }

  static async findPaginated(filter = {}, page = 1, limit = 10) {
    const query = { ...filter };
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      GymSubscriptionPayment.find(query)
        .populate('gymId', 'name publicId slug')
        .populate('receivedBy', 'fullName email')
        .populate('refundedBy', 'fullName email')
        .sort({ paymentDate: -1 })
        .skip(skip)
        .limit(limit),
      GymSubscriptionPayment.countDocuments(query)
    ]);

    return {
      data: payments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async updateByPublicId(publicId, updateData) {
    return GymSubscriptionPayment.findOneAndUpdate({ publicId }, updateData, { new: true });
  }

  static async deleteByPublicId(publicId) {
    return GymSubscriptionPayment.findOneAndDelete({ publicId });
  }
}
