import { Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User, IAddress } from './user.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import { emailService } from '../../services/email.service.js';

export class UserService {
  async getProfile(userId: string) {
    const user = await User.findOne({ _id: new Types.ObjectId(userId), isDeleted: { $ne: true } })
      .select('-refreshTokens');
    if (!user) {
      throw new AppError({ message: 'User not found', statusCode: 404, code: 'NOT_FOUND' });
    }
    return user;
  }

  async updateProfile(userId: string, data: { name?: string; phone?: string }) {
    const user = await User.findOneAndUpdate(
      { _id: new Types.ObjectId(userId), isDeleted: { $ne: true } },
      { $set: data },
      { new: true }
    ).select('-refreshTokens');

    if (!user) {
      throw new AppError({ message: 'User not found', statusCode: 404, code: 'NOT_FOUND' });
    }
    return user;
  }

  async changeEmail(userId: string, newEmail: string, currentPassword: string) {
    // Must select password to verify
    const user = await User.findOne({ _id: new Types.ObjectId(userId), isDeleted: { $ne: true } }).select('+password');
    if (!user) {
      throw new AppError({ message: 'User not found', statusCode: 404, code: 'NOT_FOUND' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password!);
    if (!isMatch) {
      throw new AppError({ message: 'Current password is incorrect', statusCode: 401, code: 'UNAUTHORIZED' });
    }

    const emailTaken = await User.findOne({ email: newEmail.toLowerCase().trim(), isDeleted: { $ne: true } });
    if (emailTaken) {
      throw new AppError({ message: 'This email address is already in use by another account', statusCode: 409, code: 'CONFLICT' });
    }

    user.email = newEmail.toLowerCase().trim();
    user.isEmailVerified = false;
    user.refreshTokens = []; // revoke all sessions — force re-login with new email
    await user.save();

    return { message: 'Email updated successfully. Please log in again with your new email.', email: user.email };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await User.findOne({ _id: new Types.ObjectId(userId), isDeleted: { $ne: true } }).select('+password');
    if (!user) {
      throw new AppError({ message: 'User not found', statusCode: 404, code: 'NOT_FOUND' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password!);
    if (!isMatch) {
      throw new AppError({ message: 'Current password is incorrect', statusCode: 401, code: 'UNAUTHORIZED' });
    }

    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword, salt);
    user.refreshTokens = []; // revoke all sessions — force re-login with new password
    await user.save();

    return { message: 'Password changed successfully. Please log in again with your new password.' };
  }


  async addAddress(userId: string, addressData: Partial<IAddress>) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError({ message: 'User not found', statusCode: 404, code: 'NOT_FOUND' });
    }

    if (addressData.isDefault || user.addresses.length === 0) {
      user.addresses.forEach((addr) => (addr.isDefault = false));
      addressData.isDefault = true;
    }

    const newAddress = {
      _id: new Types.ObjectId(),
      ...addressData
    } as IAddress;

    user.addresses.push(newAddress);
    await user.save();
    return newAddress;
  }

  async updateAddress(userId: string, addressId: string, updateData: Partial<IAddress>) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError({ message: 'User not found', statusCode: 404, code: 'NOT_FOUND' });
    }

    const addressIndex = user.addresses.findIndex((a) => a._id.toString() === addressId);
    if (addressIndex === -1) {
      throw new AppError({ message: 'Address not found', statusCode: 404, code: 'NOT_FOUND' });
    }

    if (updateData.isDefault) {
      user.addresses.forEach((addr) => (addr.isDefault = false));
    }

    const existing = user.addresses[addressIndex]!;
    Object.assign(existing, updateData);
    await user.save();
    return existing;
  }

  async deleteAddress(userId: string, addressId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError({ message: 'User not found', statusCode: 404, code: 'NOT_FOUND' });
    }

    const initialLength = user.addresses.length;
    user.addresses = user.addresses.filter((a) => a._id.toString() !== addressId);
    if (user.addresses.length === initialLength) {
      throw new AppError({ message: 'Address not found', statusCode: 404, code: 'NOT_FOUND' });
    }

    if (user.addresses.length > 0 && !user.addresses.some((a) => a.isDefault)) {
      user.addresses[0]!.isDefault = true;
    }

    await user.save();
    return { success: true };
  }

  async deleteAccount(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError({ message: 'User not found', statusCode: 404, code: 'NOT_FOUND' });
    }

    user.isDeleted = true;
    user.deletedAt = new Date();
    user.refreshTokens = [];
    await user.save();
    return { success: true };
  }

  async exportUserData(userId: string) {
    const user = await User.findById(userId).select('-password -refreshTokens');
    if (!user) {
      throw new AppError({ message: 'User not found', statusCode: 404, code: 'NOT_FOUND' });
    }

    // Lazy load related models
    const { Order } = await import('../orders/order.model.js');
    const { Review } = await import('../reviews/review.model.js');

    const orders = await Order.find({ userId: new Types.ObjectId(userId) });
    const reviews = await Review.find({ user: new Types.ObjectId(userId) });

    return {
      user,
      orders,
      reviews,
      exportedAt: new Date()
    };
  }

  async listCustomers(query: { page?: number; limit?: number; search?: string; role?: string }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = { isDeleted: { $ne: true } };
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { email: { $regex: query.search, $options: 'i' } }
      ];
    }

    if (query.role) {
      if (query.role === 'staff') {
        filter.role = 'staff';
      } else if (query.role === 'admin') {
        filter.role = { $in: ['admin', 'superadmin'] };
      } else if (query.role === 'staff_admin') {
        filter.role = { $in: ['admin', 'superadmin', 'staff'] };
      } else if (query.role === 'customer') {
        filter.role = 'customer';
      }
    }

    const [total, users, staffCount, adminCount, customerCount, suspendedCount] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter)
        .select('-password -refreshTokens -verificationToken -passwordResetToken')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments({ isDeleted: { $ne: true }, role: 'staff' }),
      User.countDocuments({ isDeleted: { $ne: true }, role: { $in: ['admin', 'superadmin'] } }),
      User.countDocuments({ isDeleted: { $ne: true }, role: 'customer' }),
      User.countDocuments({ isDeleted: { $ne: true }, isActive: false })
    ]);

    return {
      users,
      customers: users,
      stats: {
        totalStaff: staffCount,
        totalAdmins: adminCount,
        totalCustomers: customerCount,
        suspendedCount
      },
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async createStaff(data: {
    name: string;
    email: string;
    role: 'admin' | 'staff';
    password: string;
    sendResetEmail?: boolean;
  }) {
    const existing = await User.findOne({
      email: data.email.toLowerCase().trim(),
      isDeleted: { $ne: true }
    });

    if (existing) {
      throw new AppError({
        message: 'A user account with this email address already exists',
        statusCode: 409,
        code: 'CONFLICT'
      });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    const newUser = new User({
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      password: hashedPassword,
      role: data.role,
      isActive: true,
      isEmailVerified: true
    });

    let resetLink: string | undefined;
    if (data.sendResetEmail) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      newUser.passwordResetToken = resetToken;
      newUser.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
      const mailRes = await emailService.sendPasswordResetEmail(newUser.email, resetToken);
      resetLink = mailRes.resetLink;
    }

    await newUser.save();

    return {
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isActive: newUser.isActive,
        createdAt: newUser.createdAt
      },
      resetLink
    };
  }

  async updateUserRole(userId: string, role: 'superadmin' | 'admin' | 'staff' | 'customer', requestingUserId?: string) {
    const user = await User.findOne({ _id: new Types.ObjectId(userId), isDeleted: { $ne: true } });
    if (!user) {
      throw new AppError({ message: 'User not found', statusCode: 404, code: 'NOT_FOUND' });
    }

    if (userId === requestingUserId && role !== 'admin' && role !== 'superadmin') {
      throw new AppError({ message: 'You cannot revoke your own administrative privileges', statusCode: 400, code: 'INVALID_REQUEST' });
    }

    user.role = role;
    await user.save();

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    };
  }

  async toggleUserStatus(userId: string, isActive: boolean, requestingUserId?: string) {
    const user = await User.findOne({ _id: new Types.ObjectId(userId), isDeleted: { $ne: true } });
    if (!user) {
      throw new AppError({ message: 'User not found', statusCode: 404, code: 'NOT_FOUND' });
    }

    if (userId === requestingUserId && !isActive) {
      throw new AppError({ message: 'You cannot deactivate your own active admin account', statusCode: 400, code: 'INVALID_REQUEST' });
    }

    user.isActive = isActive;
    if (!isActive) {
      // Instantly revoke all active logged-in sessions across any browsers or devices
      user.refreshTokens = [];
    }

    await user.save();

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      isActive: user.isActive,
      role: user.role
    };
  }

  async deleteUser(userId: string, requestingUserId?: string) {
    const user = await User.findOne({ _id: new Types.ObjectId(userId), isDeleted: { $ne: true } });
    if (!user) {
      throw new AppError({ message: 'User not found', statusCode: 404, code: 'NOT_FOUND' });
    }

    if (userId === requestingUserId) {
      throw new AppError({ message: 'You cannot delete your own active admin account', statusCode: 400, code: 'INVALID_REQUEST' });
    }

    user.isDeleted = true;
    user.deletedAt = new Date();
    user.refreshTokens = [];
    await user.save();

    return { success: true, message: 'User account removed successfully' };
  }

  async sendPasswordResetEmail(userId: string) {
    const user = await User.findOne({ _id: new Types.ObjectId(userId), isDeleted: { $ne: true } });
    if (!user) {
      throw new AppError({ message: 'User not found', statusCode: 404, code: 'NOT_FOUND' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const mailRes = await emailService.sendPasswordResetEmail(user.email, resetToken);

    return {
      success: true,
      message: `Password reset email dispatched to ${user.email}`,
      resetLink: mailRes.resetLink
    };
  }
}

export const userService = new UserService();
