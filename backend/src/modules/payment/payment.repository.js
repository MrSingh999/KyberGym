import { Payment } from './models/Payment.model.js';

export class PaymentRepository {
  static async create(data) {
    return Payment.create(data);
  }

  static async findById(id, gymId) {
    return Payment.findOne({ _id: id, gymId })
      .populate('memberId', 'fullName memberCode')
      .populate('subscriptionId', 'startDate endDate amount status');
  }

  static async findPaginated(gymId, filter = {}, page = 1, limit = 10) {
    const query = { gymId, ...filter };
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      Payment.find(query)
        .populate('memberId', 'fullName memberCode')
        .sort({ paymentDate: -1 })
        .skip(skip)
        .limit(limit),
      Payment.countDocuments(query)
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

  static async update(id, gymId, updateData) {
    return Payment.findOneAndUpdate({ _id: id, gymId }, updateData, { new: true });
  }
}
