import { Request, Response, NextFunction } from 'express';

function cleanObject(target: any): any {
  if (!target || typeof target !== 'object') {
    return target;
  }

  if (Array.isArray(target)) {
    return target.map(cleanObject);
  }

  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(target)) {
    // Strip keys with $ or . to prevent NoSQL injection
    if (!key.startsWith('$') && !key.includes('.')) {
      clean[key] = cleanObject(value);
    }
  }
  return clean;
}

export function mongoSanitizeMiddleware() {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (req.body && typeof req.body === 'object') {
      req.body = cleanObject(req.body);
    }
    if (req.params && typeof req.params === 'object') {
      req.params = cleanObject(req.params);
    }
    next();
  };
}
