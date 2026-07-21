import mongoose from 'mongoose';
import { MemberPayment } from './models/MemberPayment.model.js';

export class MemberPaymentRepository {
  static async create(data) {
    return MemberPayment.create(data);
  }

  static async findById(id, gymId) {
    const query = { gymId };
    if (mongoose.Types.ObjectId.isValid(id)) {
      query._id = id;
    } else {
      query.publicId = id;
    }
    return MemberPayment.findOne(query)
      .populate('memberId', 'fullName publicId')
      .populate('subscriptionId', 'startDate endDate amount status publicId')
      .populate('paymentFor.planId', 'name');
  }

  static async findPaginated(gymId, filter = {}, page = 1, limit = 10) {
    const query = { gymId, ...filter };
    const skip = (page - 1) * limit;

    const [memberPayments, total] = await Promise.all([
      MemberPayment.find(query)
        .populate('memberId', 'fullName publicId')
        .populate('subscriptionId', 'startDate endDate amount status publicId')
        .populate('paymentFor.planId', 'name')
        .sort({ paymentDate: -1 })
        .skip(skip)
        .limit(limit),
      MemberPayment.countDocuments(query)
    ]);

    return {
      data: memberPayments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async update(id, gymId, updateData) {
    const query = { gymId };
    if (mongoose.Types.ObjectId.isValid(id)) {
      query._id = id;
    } else {
      query.publicId = id;
    }
    return MemberPayment.findOneAndUpdate(query, updateData, { new: true });
  }
}
