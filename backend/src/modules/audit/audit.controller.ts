import { Request, Response, NextFunction } from 'express';
import { AuditLog } from './audit.model.js';

export class AuditController {
  async getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 25));
      const skip = (page - 1) * limit;

      const filter: Record<string, any> = {};
      if (req.query.action) filter.action = req.query.action;
      if (req.query.resource) filter.resource = req.query.resource;

      const [total, logs] = await Promise.all([
        AuditLog.countDocuments(filter),
        AuditLog.find(filter)
          .populate('actor', 'name email role')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
      ]);

      res.json({
        success: true,
        data: logs,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (err) {
      next(err);
    }
  }
}

export const auditController = new AuditController();
