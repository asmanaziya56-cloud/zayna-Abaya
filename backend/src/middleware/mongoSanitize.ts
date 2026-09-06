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
    // Strip keys with $ or . to prevent NoSQL operator & property injection
    if (!key.startsWith('$') && !key.includes('.') && !key.includes('$')) {
      clean[key] = cleanObject(value);
    }
  }
  return clean;
}

function cleanInPlace(target: any): void {
  if (!target || typeof target !== 'object' || Array.isArray(target)) return;
  for (const key of Object.keys(target)) {
    if (key.startsWith('$') || key.includes('.') || key.includes('$')) {
      delete target[key];
    } else if (typeof target[key] === 'object' && target[key] !== null) {
      if (Array.isArray(target[key])) {
        target[key] = target[key].map((item: any) => cleanObject(item));
      } else {
        cleanInPlace(target[key]);
      }
    }
  }
}

export function mongoSanitizeMiddleware() {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (req.body && typeof req.body === 'object') {
      req.body = cleanObject(req.body);
    }
    if (req.params && typeof req.params === 'object') {
      req.params = cleanObject(req.params);
    }
    if (req.query && typeof req.query === 'object') {
      cleanInPlace(req.query);
    }
    next();
  };
}
