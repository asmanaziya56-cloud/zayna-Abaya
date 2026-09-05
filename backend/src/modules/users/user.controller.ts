import { Request, Response, NextFunction } from 'express';
import { userService } from './user.service.js';

export class UserController {
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.getProfile(req.user!._id);
      res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.updateProfile(req.user!._id, req.body);
      res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  }

  async changeEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await userService.changeEmail(req.user!._id, req.body.newEmail, req.body.currentPassword);
      // Clear refresh token cookie — user must log in again with new email
      res.clearCookie('refreshToken');
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await userService.changePassword(req.user!._id, req.body.currentPassword, req.body.newPassword);
      // Clear refresh token cookie — user must log in again with new password
      res.clearCookie('refreshToken');
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }


  async addAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const address = await userService.addAddress(req.user!._id, req.body);
      res.status(201).json({ success: true, data: address });
    } catch (err) {
      next(err);
    }
  }

  async updateAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const address = await userService.updateAddress(req.user!._id, req.params.addressId as string, req.body);
      res.json({ success: true, data: address });
    } catch (err) {
      next(err);
    }
  }

  async deleteAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await userService.deleteAddress(req.user!._id, req.params.addressId as string);
      res.json({ success: true, data: { message: 'Address removed successfully' } });
    } catch (err) {
      next(err);
    }
  }

  async deleteAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await userService.deleteAccount(req.user!._id);
      res.clearCookie('refreshToken');
      res.json({ success: true, data: { message: 'Account deleted successfully' } });
    } catch (err) {
      next(err);
    }
  }

  async exportData(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await userService.exportUserData(req.user!._id);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async listCustomers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await userService.listCustomers(req.query);
      res.json({
        success: true,
        data: result.customers,
        users: result.users,
        stats: result.stats,
        pagination: result.pagination
      });
    } catch (err) {
      next(err);
    }
  }

  async createStaff(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await userService.createStaff(req.body);
      res.status(201).json({
        success: true,
        data: result.user,
        resetLink: result.resetLink,
        message: 'Staff member created successfully'
      });
    } catch (err) {
      next(err);
    }
  }

  async updateUserRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await userService.updateUserRole(
        req.params.userId as string,
        req.body.role,
        req.user!._id
      );
      res.json({
        success: true,
        data: result,
        message: `Role updated to ${req.body.role}`
      });
    } catch (err) {
      next(err);
    }
  }

  async toggleUserStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await userService.toggleUserStatus(
        req.params.userId as string,
        req.body.isActive,
        req.user!._id
      );
      res.json({
        success: true,
        data: result,
        message: req.body.isActive ? 'Account activated' : 'Account suspended & active sessions revoked'
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await userService.deleteUser(
        req.params.userId as string,
        req.user!._id
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async sendResetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await userService.sendPasswordResetEmail(req.params.userId as string);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async adminSetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await userService.adminSetPassword(req.params.userId as string, req.body.newPassword);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

export const userController = new UserController();
