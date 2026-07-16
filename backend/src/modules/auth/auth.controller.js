import { AuthService } from "./auth.service.js";
import { ApiSuccess } from "../../shared/ApiSuccess.js";
import httpStatus from "http-status";
import { env } from "../../config/env.js";

// Helper to set HTTP-only cookie
const setRefreshTokenCookie = (res, token) => {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export class AuthController {
  static async registerOwner(req, res) {
    const { user, accessToken, refreshToken, gym } =
      await AuthService.registerOwner(req.body);
    setRefreshTokenCookie(res, refreshToken);

    // Strip password and OTPs from response
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      gymId: user.gymId,
    };

    return ApiSuccess.send(
      res,
      httpStatus.CREATED,
      "Owner registered successfully",
      {
        user: userResponse,
        gym,
        accessToken,
      },
    );
  }

  static async login(req, res) {
    const { email, password } = req.body;
    const gymId = req.gym._id; // Resolved by tenantMiddleware

    const {
      user,
      accessToken,
      refreshToken,
      enabledFeatures,
      subscriptionStatus,
      subscriptionExpiry,
    } = await AuthService.login(email, password, gymId);
    setRefreshTokenCookie(res, refreshToken);

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      gymId: user.gymId,
    };

    return ApiSuccess.send(res, httpStatus.OK, "Login successful", {
      user: userResponse,
      accessToken,
      enabledFeatures,
      subscriptionStatus,
      subscriptionExpiry,
    });
  }

  static async logout(req, res) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
    });
    return ApiSuccess.send(res, httpStatus.OK, "Logged out successfully");
  }

  static async refreshToken(req, res) {
    const oldRefreshToken = req.cookies.refreshToken;
    const { accessToken, refreshToken } =
      await AuthService.refreshToken(oldRefreshToken);

    setRefreshTokenCookie(res, refreshToken);

    return ApiSuccess.send(res, httpStatus.OK, "Token refreshed successfully", {
      accessToken,
    });
  }

  static async forgotPassword(req, res) {
    const { email } = req.body;
    const gymId = req.gym._id;

    await AuthService.forgotPassword(email, gymId);

    return ApiSuccess.send(
      res,
      httpStatus.OK,
      "If an account exists, a reset code has been sent",
    );
  }

  static async resetPassword(req, res) {
    const { email, otp, newPassword } = req.body;
    const gymId = req.gym._id;

    await AuthService.resetPassword(email, otp, newPassword, gymId);

    return ApiSuccess.send(res, httpStatus.OK, "Password reset successful");
  }

  static async verifyEmail(req, res) {
    const { email, otp } = req.body;
    const gymId = req.gym._id;

    await AuthService.verifyEmail(email, otp, gymId);

    return ApiSuccess.send(res, httpStatus.OK, "Email verified successfully");
  }

  static async changePassword(req, res) {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    await AuthService.changePassword(userId, currentPassword, newPassword);

    return ApiSuccess.send(res, httpStatus.OK, "Password changed successfully");
  }

  static async getMe(req, res) {
    const userResponse = {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      gymId: req.user.gymId,
      isEmailVerified: req.user.isEmailVerified,
    };

    return ApiSuccess.send(res, httpStatus.OK, "User profile retrieved", {
      user: userResponse,
    });
  }
}
