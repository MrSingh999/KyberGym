import mongoose from 'mongoose';
import { GymSubscriptionPaymentRepository } from './gymSubscriptionPayment.repository.js';
import { Gym } from '../gyms/models/Gym.model.js';
import createError from 'http-errors';

const resolveGymId = async (id) => {
  if (!id) return id;
  if (mongoose.Types.ObjectId.isValid(id)) return id;
  const gym = await Gym.findOne({ publicId: id }).select('_id').lean();
  if (!gym) throw createError.NotFound('Gym not found');
  return gym._id;
};

const ALLOWED_UPDATE_FIELDS = ['amount', 'paymentMethod', 'paymentReference', 'paymentDate', 'gymId', 'subscriptionId', 'notes'];
const IMMUTABLE_FIELDS = ['publicId', 'receivedBy', 'status', 'refundedAt', 'refundedBy'];

export class GymSubscriptionPaymentService {
  static async createPayment(superAdminId, data) {
    const gymId = await resolveGymId(data.gymId);
    const gym = await Gym.findById(gymId);
    if (!gym || gym.isDeleted) throw createError.NotFound('Gym not found');

    const paymentDate = data.paymentDate ? new Date(data.paymentDate) : new Date();

    return GymSubscriptionPaymentRepository.create({
      gymId,
      subscriptionId: data.subscriptionId,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      paymentReference: data.paymentReference,
      paymentDate,
      status: data.status || 'completed',
      receivedBy: superAdminId,
      notes: data.notes,
    });
  }

  static async getPayments(query) {
    const { page = 1, limit = 10, gymId, subscriptionId, status, paymentMethod, search, dateFrom, dateTo } = query;
    const filter = {};

    if (gymId) {
      filter.gymId = await resolveGymId(gymId);
    }
    if (subscriptionId) filter.subscriptionId = subscriptionId;
    if (status) filter.status = status;
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (dateFrom || dateTo) {
      filter.paymentDate = {};
      if (dateFrom) filter.paymentDate.$gte = new Date(dateFrom);
      if (dateTo) filter.paymentDate.$lte = new Date(dateTo);
    }

    if (search) {
      filter.$or = [
        { paymentReference: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
      ];
    }

    return GymSubscriptionPaymentRepository.findPaginated(filter, Number(page), Number(limit));
  }

  static async getPaymentById(publicId) {
    const payment = await GymSubscriptionPaymentRepository.findByPublicId(publicId);
    if (!payment) throw createError.NotFound('Gym subscription payment not found');
    return payment;
  }

  static async updatePayment(publicId, data) {
    const payment = await GymSubscriptionPaymentRepository.findByPublicId(publicId);
    if (!payment) throw createError.NotFound('Gym subscription payment not found');

    if (payment.status === 'refunded') {
      throw createError.BadRequest('Cannot update a refunded payment');
    }

    const updateData = {};
    for (const field of ALLOWED_UPDATE_FIELDS) {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    }
    for (const field of IMMUTABLE_FIELDS) {
      if (data[field] !== undefined) {
        throw createError.BadRequest(`Field "${field}" cannot be modified`);
      }
    }

    if (data.gymId) {
      updateData.gymId = await resolveGymId(data.gymId);
    }
    if (data.paymentDate) {
      updateData.paymentDate = new Date(data.paymentDate);
    }

    const updated = await GymSubscriptionPaymentRepository.updateByPublicId(publicId, updateData);
    if (!updated) throw createError.NotFound('Gym subscription payment not found');
    return updated;
  }

  static async refundPayment(publicId, superAdminId, data) {
    const payment = await GymSubscriptionPaymentRepository.findByPublicId(publicId);
    if (!payment) throw createError.NotFound('Gym subscription payment not found');
    if (payment.status === 'refunded') {
      throw createError.BadRequest('Payment is already refunded');
    }

    const updated = await GymSubscriptionPaymentRepository.updateByPublicId(publicId, {
      status: 'refunded',
      refundedAt: new Date(),
      refundedBy: superAdminId,
      notes: data.notes ? `Refunded: ${data.notes}` : 'Refunded',
    });

    if (!updated) throw createError.NotFound('Gym subscription payment not found');
    return updated;
  }

  static async deletePayment(publicId) {
    const payment = await GymSubscriptionPaymentRepository.findByPublicId(publicId);
    if (!payment) throw createError.NotFound('Gym subscription payment not found');

    await GymSubscriptionPaymentRepository.deleteByPublicId(publicId);
    return { message: 'Gym subscription payment deleted successfully' };
  }
}
