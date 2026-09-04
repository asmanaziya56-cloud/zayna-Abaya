import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service.js';
import { env } from '../../config/env.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.verifyEmail(req.body.token);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const clientInfo = {
        device: req.headers['user-agent'] || 'Unknown',
        ip: req.ip || req.socket.remoteAddress
      };

      const { user, accessToken, refreshToken } = await authService.login(req.body, clientInfo);

      res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
      res.json({
        success: true,
        data: {
          user,
          accessToken
        }
      });
    } catch (err) {
      next(err);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Refresh token cookie missing'
          }
        });
        return;
      }

      const clientInfo = {
        device: req.headers['user-agent'] || 'Unknown',
        ip: req.ip || req.socket.remoteAddress
      };

      const tokens = await authService.refreshToken(refreshToken, clientInfo);

      res.cookie('refreshToken', tokens.refreshToken, COOKIE_OPTIONS);
      res.json({
        success: true,
        data: {
          accessToken: tokens.accessToken
        }
      });
    } catch (err) {
      next(err);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.user?._id) {
        await authService.logout(req.user._id, req.cookies?.refreshToken);
      }
      res.clearCookie('refreshToken', { ...COOKIE_OPTIONS, maxAge: 0 });
      res.json({ success: true, data: { message: 'Logged out successfully' } });
    } catch (err) {
      next(err);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.forgotPassword(req.body.email);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.resetPassword(req.body.token, req.body.password);
      res.clearCookie('refreshToken');
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async listSessions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sessions = await authService.listSessions(req.user!._id);
      res.json({ success: true, data: sessions });
    } catch (err) {
      next(err);
    }
  }

  async revokeSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await authService.revokeSession(req.user!._id, Number(req.params.sessionIndex));
      res.json({ success: true, data: { message: 'Session revoked' } });
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
