import { Types } from 'mongoose';

export interface IUserPayload {
  _id: string;
  email: string;
  role: 'superadmin' | 'admin' | 'staff' | 'customer';
  sessionId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: IUserPayload;
      rawBody?: Buffer;
    }
  }
}

export {};
