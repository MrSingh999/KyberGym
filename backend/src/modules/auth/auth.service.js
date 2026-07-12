import mongoose from 'mongoose';
import createError from 'http-errors';
import { Gym } from '../gyms/models/Gym.model.js';
import { User } from '../users/models/User.model.js';
import { SaasPlan } from '../saasPlan/models/SaasPlan.model.js';
import { GymSubscription } from '../subscription/models/GymSubscription.model.js';
import { ROLES } from '../../shared/constants.js';
import { hashData, compareData, generateOTP, generateAccessToken, generateRefreshToken, verifyToken } from './auth.utils.js';
import { logger } from '../../config/logger.js';
import { Resend } from 'resend';

// The user will provide the API key, we should check it exists eventually
const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder');

export class AuthService {
  
  static async registerOwner(data) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Check Subdomain collision
      const existingGym = await Gym.findOne({ subdomain: data.subdomain }).session(session);
      if (existingGym) {
        throw createError.Conflict('Subdomain is already taken');
      }

      // 1.5 Fetch default SaaS Plan
      const plan = await SaasPlan.findOne({ slug: 'starter-trial' }).session(session);
      if (!plan) {
        throw createError.InternalServerError('Default subscription plan not found');
      }

      // 2. Create Gym (Copying features from the plan)
      const gym = new Gym({
        name: data.gymName,
        slug: data.subdomain,
        subdomain: data.subdomain,
        ownerId: new mongoose.Types.ObjectId(), // Placeholder
        features: plan.features
      });

      await gym.save({ session });

      // 2.5 Create Gym Subscription
      const now = new Date();
      const trialEnds = new Date(now.getTime() + (plan.trialDays * 24 * 60 * 60 * 1000));
      
      const subscription = new GymSubscription({
        gymId: gym._id,
        planId: plan._id,
        status: 'trial',
        startDate: now,
        trialEndsAt: trialEnds
      });
      await subscription.save({ session });

      // 3. Hash password
      const hashedPassword = await hashData(data.password);

      // 4. Create Owner User
      const user = new User({
        _id: gym.ownerId, // Set ID to match placeholder
        gymId: gym._id,
        role: ROLES.GYM_ADMIN, // Using constant from Phase 1
        name: data.ownerName,
        email: data.email,
        password: hashedPassword,
        phone: data.phone,
      });

      // 5. Generate Email OTP
      const otp = generateOTP();
      user.emailVerificationOTP = await hashData(otp);
      user.emailVerificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

      await user.save({ session });

      // Commit transaction
      await session.commitTransaction();
      session.endSession();

      logger.info(`New Gym Registered: ${gym._id}, Owner: ${user._id}`);

      // 6. Send OTP (Don't await to avoid blocking response)
      resend.emails.send({
        from: 'GymSaaS <noreply@yourdomain.com>',
        to: user.email,
        subject: 'Verify your email address',
        html: `<p>Your verification code is: <strong>${otp}</strong></p>`
      }).catch(err => logger.error(`Failed to send welcome email to ${user.email}:`, err));

      // 7. Issue Tokens
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      return { user, accessToken, refreshToken, gym };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  static async login(email, password, gymId) {
    const user = await User.findOne({ email, gymId });
    if (!user) {
      throw createError.Unauthorized('Invalid email or password');
    }

    if (user.status !== 'active') {
      throw createError.Forbidden(`User account is ${user.status}`);
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

    return { user, accessToken, refreshToken };
  }

  static async refreshToken(oldRefreshToken) {
    if (!oldRefreshToken) {
      throw createError.Unauthorized('Refresh token required');
    }

    try {
      const decoded = verifyToken(oldRefreshToken);
      
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
      // Don't leak whether the email exists, just return success
      return true;
    }

    const otp = generateOTP();
    user.passwordResetOTP = await hashData(otp);
    user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    await user.save();

    logger.info(`Password reset requested for: ${email}`);

    resend.emails.send({
      from: 'GymSaaS <noreply@yourdomain.com>',
      to: user.email,
      subject: 'Password Reset Request',
      html: `<p>Your password reset code is: <strong>${otp}</strong>. It expires in 15 minutes.</p>`
    }).catch(err => logger.error(`Failed to send password reset email to ${email}:`, err));

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
