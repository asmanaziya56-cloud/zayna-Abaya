import { Request, Response, NextFunction } from 'express';

export function roleGuard(allowedRoles: Array<'superadmin' | 'admin' | 'staff' | 'customer'>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role) && req.user.role !== 'superadmin') {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions for this operation'
        }
      });
      return;
    }

    next();
  };
}
