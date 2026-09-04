import jwt, { SignOptions, VerifyOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';
import { IUserPayload } from '../types/express.js';

export function signAccessToken(payload: IUserPayload): string {
  const options: SignOptions = {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as any,
    algorithm: 'HS256'
  };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, options);
}

export function signRefreshToken(payload: IUserPayload): string {
  const options: SignOptions = {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
    algorithm: 'HS256'
  };
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, options);
}

export function verifyAccessToken(token: string): IUserPayload {
  const options: VerifyOptions = {
    algorithms: ['HS256']
  };
  return jwt.verify(token, env.JWT_ACCESS_SECRET, options) as IUserPayload;
}

export function verifyRefreshToken(token: string): IUserPayload {
  const options: VerifyOptions = {
    algorithms: ['HS256']
  };
  return jwt.verify(token, env.JWT_REFRESH_SECRET, options) as IUserPayload;
}
