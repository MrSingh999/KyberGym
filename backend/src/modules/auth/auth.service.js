import createError from 'http-errors';
import { GymService } from '../gyms/gym.service.js';
import { Gym } from '../gyms/models/Gym.model.js';
import { checkSubscriptionStatus } from '../gyms/subscription.helper.js';
import { compareData, generateOTP, hashData, generateAccessToken, generateRefreshToken, verifyRefreshToken } from './auth.utils.js';
import { User } from '../users/models/User.model.js';
import { logger } from '../../config/logger.js';
import { env } from '../../config/env.js';
import { Resend } from 'resend';

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export class AuthService {

  static async registerOwner(data) {
    const { gym, user } = await GymService.createGymWithAdmin({
      name: data.gymName,
      subdomain: data.subdomain,
      ownerName: data.ownerName,
      email: data.email,
      password: data.password,
      phone: data.phone,
    });

    const otp = generateOTP();
    user.emailVerificationOTP = await hashData(otp);
    user.emailVerificationExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    logger.info(`New Gym Registered: ${gym._id}, Owner: ${user._id}`);

    if (resend) {
      resend.emails.send({
        from: 'KyberGym <noreply@kyberfitness.com>',
        to: user.email,
        subject: 'Verify your email address',
        html: `<p>Your verification code is: <strong>${otp}</strong></p>`
      }).catch(err => logger.error(`Failed to send welcome email to ${user.email}:`, err));
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    return { user, accessToken, refreshToken, gym };
  }

  static async login(email, password, gymId) {
    const user = await User.findOne({ email, gymId });
    if (!user) {
      throw createError.Unauthorized('Invalid email or password');
    }

    if (user.status !== 'active') {
      throw createError.Forbidden(`User account is ${user.status}`);
    }

    const gym = await checkSubscriptionStatus(await Gym.findById(gymId));
    if (gym && gym.subscription) {
      if (gym.subscription.status === 'expired') {
        throw createError.Forbidden('Gym subscription has expired. Please contact the Super Admin.');
      }
      if (gym.subscription.status === 'suspended') {
        throw createError.Forbidden('Gym subscription is suspended. Please contact the Super Admin.');
      }
    }

    const isMatch = await compareData(password, user.password);
    if (!isMatch) {
      logger.warn(`Failed login attempt for email: ${email} at Gym: ${gymId}`);
      throw createError.Unauthorized('Invalid email or password');
    }

    // Update lastLogin
    user.lastLogin = new Date();
    await user.save();

    logger.info(`User logged in: ${user._id} at Gym: ${gymId}`);

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    return {
      user,
      accessToken,
      refreshToken,
      enabledFeatures: gym.features,
      subscriptionStatus: gym.subscription?.status || 'trial',
      subscriptionExpiry: gym.subscription?.expiresAt || null,
    };
  }

  static async refreshToken(oldRefreshToken) {
    if (!oldRefreshToken) {
      throw createError.Unauthorized('Refresh token required');
    }

    try {
      const decoded = verifyRefreshToken(oldRefreshToken);

      const user = await User.findById(decoded.userId);
      if (!user) {
        throw createError.Unauthorized('User not found');
      }

      // Check token version to detect invalidation
      if (user.tokenVersion !== decoded.tokenVersion) {
        throw createError.Unauthorized('Token has been revoked');
      }

      const accessToken = generateAccessToken(user);
      const newRefreshToken = generateRefreshToken(user); // Rotate refresh token

      return { accessToken, refreshToken: newRefreshToken };
    } catch (error) {
      throw createError.Unauthorized('Invalid or expired refresh token');
    }
  }

  static async forgotPassword(email, gymId) {
    const user = await User.findOne({ email, gymId });
    if (!user) {
      // Don't leak whether the email exists
      return true;
    }

    const otp = generateOTP();
    user.passwordResetOTP = await hashData(otp);
    user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    await user.save();

    logger.info(`Password reset requested for: ${email}`);

    if (resend) {
      resend.emails.send({
        from: 'KyberGym <noreply@kyberfitness.com>',
        to: user.email,
        subject: 'Password Reset Request',
        html: `<p>Your password reset code is: <strong>${otp}</strong>. It expires in 15 minutes.</p>`
      }).catch(err => logger.error(`Failed to send password reset email to ${email}:`, err));
    }

    return true;
  }

  static async resetPassword(email, otp, newPassword, gymId) {
    const user = await User.findOne({ email, gymId });
    if (!user) throw createError.BadRequest('Invalid reset request');

    if (!user.passwordResetOTP || user.passwordResetExpires < new Date()) {
      throw createError.BadRequest('OTP has expired or is invalid');
    }

    const isValid = await compareData(otp, user.passwordResetOTP);
    if (!isValid) throw createError.BadRequest('Invalid OTP');

    // Update password & invalidate all existing sessions
    user.password = await hashData(newPassword);
    user.tokenVersion += 1;
    user.passwordChangedAt = new Date();
    user.passwordResetOTP = undefined;
    user.passwordResetExpires = undefined;

    await user.save();
    return true;
  }

  static async verifyEmail(email, otp, gymId) {
    const user = await User.findOne({ email, gymId });
    if (!user) throw createError.BadRequest('Invalid verification request');

    if (!user.emailVerificationOTP || user.emailVerificationExpires < new Date()) {
      throw createError.BadRequest('OTP has expired or is invalid');
    }

    const isValid = await compareData(otp, user.emailVerificationOTP);
    if (!isValid) throw createError.BadRequest('Invalid OTP');

    user.isEmailVerified = true;
    user.emailVerificationOTP = undefined;
    user.emailVerificationExpires = undefined;

    await user.save();
    return true;
  }
}
