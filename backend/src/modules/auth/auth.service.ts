import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { User } from '../users/user.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt.js';
import { emailService } from '../../services/email.service.js';
import { logAuditEvent } from '../audit/audit.model.js';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

export class AuthService {
  async register(data: { name: string; email: string; password: string }) {
    const existing = await User.findOne({ email: data.email });
    if (existing) {
      throw new AppError({
        message: 'An account with this email address already exists',
        statusCode: 409,
        code: 'CONFLICT'
      });
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(data.password, salt);

    // Crypto-random email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await User.create({
      name: data.name,
      email: data.email,
      password: passwordHash,
      verificationToken,
      verificationTokenExpires: verificationExpires,
      isEmailVerified: false
    });

    await emailService.sendVerificationEmail(user.email, verificationToken);

    await logAuditEvent({
      actor: user._id.toString(),
      actorEmail: user.email,
      action: 'USER_REGISTERED',
      resource: 'User',
      resourceId: user._id.toString()
    });

    return {
      message: 'Registration successful. Please verify your email address.',
      userId: user._id
    };
  }

  async verifyEmail(token: string) {
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: new Date() }
    });

    if (!user) {
      throw new AppError({
        message: 'Invalid or expired verification token',
        statusCode: 400,
        code: 'INVALID_REQUEST'
      });
    }

    user.isEmailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    await logAuditEvent({
      actor: user._id.toString(),
      actorEmail: user.email,
      action: 'EMAIL_VERIFIED',
      resource: 'User',
      resourceId: user._id.toString()
    });

    return { message: 'Email address verified successfully. You can now log in.' };
  }

  async login(credentials: { email: string; password: string }, clientInfo?: { device?: string; ip?: string }) {
    const email = credentials.email?.toLowerCase().trim();
    const user = await User.findOne({ email, isDeleted: { $ne: true } }).select(
      '+password +verificationToken'
    );

    if (!user) {
      // Generic message to prevent email enumeration
      throw new AppError({
        message: 'Invalid email or password',
        statusCode: 401,
        code: 'UNAUTHORIZED'
      });
    }

    // Account lockout check
    if (user.isLocked()) {
      const waitMinutes = Math.ceil((user.lockUntil!.getTime() - Date.now()) / (60 * 1000));
      throw new AppError({
        message: `Account is temporarily locked due to multiple failed login attempts. Try again in ${waitMinutes} minute(s).`,
        statusCode: 429,
        code: 'RATE_LIMIT_EXCEEDED'
      });
    }

    const isMatch = await bcrypt.compare(credentials.password, user.password!);
    if (!isMatch) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.lockUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
      }
      await user.save();

      throw new AppError({
        message: 'Invalid email or password',
        statusCode: 401,
        code: 'UNAUTHORIZED'
      });
    }

    if (user.isActive === false) {
      throw new AppError({
        message: 'Your account has been deactivated or suspended by an administrator. Please contact your store owner.',
        statusCode: 403,
        code: 'FORBIDDEN'
      });
    }

    // Reset login attempts on successful login
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLoginAt = new Date();
    if (clientInfo?.ip) {
      user.lastLoginIp = clientInfo.ip;
    }

    const payload = {
      _id: user._id.toString(),
      email: user.email,
      role: user.role
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    // Hash refresh token before saving in DB
    const refreshSalt = await bcrypt.genSalt(10);
    const tokenHash = await bcrypt.hash(refreshToken, refreshSalt);

    user.refreshTokens.push({
      tokenHash,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      device: clientInfo?.device || 'Unknown',
      ipAddress: clientInfo?.ip || 'Unknown'
    });

    // Prune expired sessions (keep max 10 active)
    user.refreshTokens = user.refreshTokens
      .filter((s) => s.expiresAt > new Date())
      .slice(-10);

    await user.save();

    await logAuditEvent({
      actor: user._id.toString(),
      actorEmail: user.email,
      action: 'USER_LOGIN',
      resource: 'User',
      resourceId: user._id.toString(),
      ipAddress: clientInfo?.ip
    });

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      },
      accessToken,
      refreshToken
    };
  }

  async refreshToken(oldRefreshToken: string, clientInfo?: { device?: string; ip?: string }) {
    let payload;
    try {
      payload = verifyRefreshToken(oldRefreshToken);
    } catch {
      throw new AppError({
        message: 'Refresh token invalid or expired',
        statusCode: 401,
        code: 'REFRESH_TOKEN_INVALID'
      });
    }

    const user = await User.findById(payload._id);
    if (!user || user.isDeleted) {
      throw new AppError({
        message: 'User account no longer active',
        statusCode: 401,
        code: 'UNAUTHORIZED'
      });
    }

    // Locate matching refresh token
    let matchIndex = -1;
    for (let i = 0; i < user.refreshTokens.length; i++) {
      const match = await bcrypt.compare(oldRefreshToken, user.refreshTokens[i]!.tokenHash);
      if (match) {
        matchIndex = i;
        break;
      }
    }

    // If token not found in user's active sessions, it could indicate token reuse / breach!
    if (matchIndex === -1) {
      // Breach detection: revoke all sessions for this user
      user.refreshTokens = [];
      await user.save();

      await logAuditEvent({
        actor: user._id.toString(),
        actorEmail: user.email,
        action: 'TOKEN_REUSE_DETECTED_ALL_REVOKED',
        resource: 'User',
        resourceId: user._id.toString(),
        ipAddress: clientInfo?.ip
      });

      throw new AppError({
        message: 'Invalid refresh token. All active sessions have been terminated for security.',
        statusCode: 401,
        code: 'REFRESH_TOKEN_INVALID'
      });
    }

    // Rotate token: issue new pair and replace current session entry
    const newPayload = {
      _id: user._id.toString(),
      email: user.email,
      role: user.role
    };

    const newAccessToken = signAccessToken(newPayload);
    const newRefreshToken = signRefreshToken(newPayload);

    const refreshSalt = await bcrypt.genSalt(10);
    const newTokenHash = await bcrypt.hash(newRefreshToken, refreshSalt);

    user.refreshTokens[matchIndex] = {
      tokenHash: newTokenHash,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      device: clientInfo?.device || user.refreshTokens[matchIndex]!.device,
      ipAddress: clientInfo?.ip || user.refreshTokens[matchIndex]!.ipAddress
    };

    await user.save();

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  }

  async logout(userId: string, refreshToken?: string) {
    const user = await User.findById(userId);
    if (!user) return;

    if (refreshToken) {
      for (let i = 0; i < user.refreshTokens.length; i++) {
        const match = await bcrypt.compare(refreshToken, user.refreshTokens[i]!.tokenHash);
        if (match) {
          user.refreshTokens.splice(i, 1);
          break;
        }
      }
    } else {
      user.refreshTokens = [];
    }

    await user.save();
  }

  async forgotPassword(email: string) {
    const user = await User.findOne({ email, isDeleted: { $ne: true } });
    if (!user) {
      // Always return success message to prevent user enumeration
      return { message: 'If that email address exists in our system, a password reset link has been sent.' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const mailResult = await emailService.sendPasswordResetEmail(user.email, resetToken);

    return {
      message: 'If that email address exists in our system, a password reset link has been sent.',
      resetLink: mailResult.resetLink
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() }
    });

    if (!user) {
      throw new AppError({
        message: 'Password reset token is invalid or has expired',
        statusCode: 400,
        code: 'INVALID_REQUEST'
      });
    }

    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword, salt);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshTokens = []; // Revoke all sessions on password reset
    await user.save();

    await logAuditEvent({
      actor: user._id.toString(),
      actorEmail: user.email,
      action: 'PASSWORD_RESET',
      resource: 'User',
      resourceId: user._id.toString()
    });

    return { message: 'Password has been reset successfully. Please log in with your new credentials.' };
  }

  async listSessions(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError({ message: 'User not found', statusCode: 404, code: 'NOT_FOUND' });
    }

    return user.refreshTokens.map((s, idx) => ({
      id: idx.toString(),
      createdAt: s.createdAt,
      expiresAt: s.expiresAt,
      device: s.device,
      ipAddress: s.ipAddress
    }));
  }

  async revokeSession(userId: string, sessionIndex: number) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError({ message: 'User not found', statusCode: 404, code: 'NOT_FOUND' });
    }

    if (sessionIndex < 0 || sessionIndex >= user.refreshTokens.length) {
      throw new AppError({ message: 'Session not found', statusCode: 404, code: 'NOT_FOUND' });
    }

    user.refreshTokens.splice(sessionIndex, 1);
    await user.save();
    return { success: true };
  }
}

export const authService = new AuthService();
