import { CustomDomainRepository } from './customDomain.repository.js';
import createError from 'http-errors';
import { customAlphabet } from 'nanoid';

const generateToken = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 32);

export class CustomDomainService {
  static async requestDomain(gymId, data) {
    const existing = await CustomDomainRepository.findByGymId(gymId);
    if (existing) {
      throw createError.Conflict('Gym already has a custom domain configuration. Delete it first.');
    }

    const verificationToken = `kybergym-verify=${generateToken()}`;

    return CustomDomainRepository.create({
      gymId,
      domain: data.domain,
      verificationToken,
      status: 'pending'
    });
  }

  static async getDomain(gymId) {
    const domain = await CustomDomainRepository.findByGymId(gymId);
    if (!domain) throw createError.NotFound('Custom domain not found for this gym');
    return domain;
  }

  static async deleteDomain(gymId) {
    const domain = await CustomDomainRepository.delete(gymId);
    if (!domain) throw createError.NotFound('Custom domain not found');
    return domain;
  }

  static async verifyDomain(gymId) {
    const domain = await CustomDomainRepository.findByGymId(gymId);
    if (!domain) throw createError.NotFound('Custom domain not found');

    if (domain.status === 'verified' || domain.status === 'active') {
      throw createError.BadRequest('Domain is already verified');
    }

    // In a real implementation, we would dispatch a job to check `dns.resolveTxt()`
    // For now, we mock the success.
    const isVerifiedMock = true;

    if (isVerifiedMock) {
      domain.status = 'active';
      domain.verifiedAt = new Date();
      await domain.save();
      return domain;
    } else {
      throw createError.BadRequest('TXT record not found. Verification failed.');
    }
  }
}
