import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { env } from '../../../config/env.js';

/**
 * Hash a plain text string using bcrypt
 */
export const hashData = async (data, saltRounds = 10) => {
  const salt = await bcrypt.genSalt(saltRounds);
  return bcrypt.hash(data, salt);
};

/**
 * Compare a plain text string with a bcrypt hash
 */
export const compareData = async (data, hashedData) => {
  return bcrypt.compare(data, hashedData);
};

/**
 * Generate a cryptographically secure 6-digit OTP
 */
export const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Generate JWT Access Token
 */
export const generateAccessToken = (user) => {
  return jwt.sign(
    { 
      userId: user._id, 
      gymId: user.gymId, 
      role: user.role, 
      tokenVersion: user.tokenVersion 
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN } // e.g., '15m'
  );
};

/**
 * Generate JWT Refresh Token
 */
export const generateRefreshToken = (user) => {
  return jwt.sign(
    { 
      userId: user._id, 
      gymId: user.gymId, 
      tokenVersion: user.tokenVersion 
    },
    env.JWT_SECRET, // Note: you could use a separate REFRESH_SECRET
    { expiresIn: '7d' } 
  );
};

/**
 * Verify JWT
 */
export const verifyToken = (token) => {
  return jwt.verify(token, env.JWT_SECRET);
};
