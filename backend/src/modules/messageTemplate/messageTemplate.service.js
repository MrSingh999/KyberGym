import { MessageTemplateRepository } from './messageTemplate.repository.js';
import createError from 'http-errors';

export class MessageTemplateService {
  static async createTemplate(gymId, userId, data) {
    if (data.channel === 'email' && !data.subject) {
      throw createError.BadRequest('Subject is required for email templates');
    }

    return MessageTemplateRepository.create({
      ...data,
      gymId,
      createdBy: userId
    });
  }

  static async getTemplates(gymId, query) {
    const { page = 1, limit = 10, type, channel, active } = query;
    const filter = {};

    if (type) filter.type = type;
    if (channel) filter.channel = channel;
    if (active !== undefined) filter.active = active === 'true';

    return MessageTemplateRepository.findPaginated(gymId, filter, Number(page), Number(limit));
  }

  static async updateTemplate(id, gymId, data) {
    const template = await MessageTemplateRepository.update(id, gymId, data);
    if (!template) throw createError.NotFound('Message template not found');
    return template;
  }

  static async deleteTemplate(id, gymId) {
    const template = await MessageTemplateRepository.delete(id, gymId);
    if (!template) throw createError.NotFound('Message template not found');
    return template;
  }
}
