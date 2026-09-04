import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

export interface AppErrorOptions {
  message: string;
  statusCode?: number;
  code?: string;
  fields?: Record<string, string[]>;
}

export class AppError extends Error {
  statusCode: number;
  code: string;
  fields?: Record<string, string[]>;

  constructor({ message, statusCode = 500, code = 'INTERNAL_ERROR', fields }: AppErrorOptions) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.fields = fields;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  let statusCode = err.statusCode || 500;
  let code = err.code || 'INTERNAL_ERROR';
  let message = err.message || 'An unexpected error occurred';
  let fields: Record<string, string[]> | undefined = err.fields;

  // Handle Zod validation error
  if (err instanceof ZodError) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed';
    const fieldMap: Record<string, string[]> = {};
    for (const issue of err.issues) {
      const path = issue.path.join('.') || 'body';
      if (!fieldMap[path]) {
        fieldMap[path] = [];
      }
      fieldMap[path].push(issue.message);
    }
    fields = fieldMap;
  }

  // Handle MongoDB Duplicate Key (11000)
  if (err.code === 11000) {
    statusCode = 409;
    code = 'CONFLICT';
    const key = Object.keys(err.keyPattern || err.keyValue || {})[0] || 'field';
    message = `A record with this ${key} already exists`;
  }

  // Handle MongoDB CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    code = 'INVALID_REQUEST';
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Handle JWT errors
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'TOKEN_EXPIRED';
    message = 'Authentication token expired';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'TOKEN_INVALID';
    message = 'Invalid authentication token';
  }

  // Log unhandled server errors (redacting secrets)
  if (statusCode >= 500) {
    logger.error('Unhandled server error', {
      method: req.method,
      url: req.originalUrl,
      error: err.message,
      stack: err.stack
    });
  } else if (env.NODE_ENV === 'development') {
    logger.warn('Client request rejected', {
      method: req.method,
      url: req.originalUrl,
      statusCode,
      code,
      message,
      fields
    });
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(fields ? { fields } : {})
    }
  });
}
