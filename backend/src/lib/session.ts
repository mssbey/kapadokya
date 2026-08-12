import crypto from 'crypto';
import type { CookieOptions, Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/errorHandler';

export const SESSION_COOKIE = 'dc_session';
export const CSRF_COOKIE = 'dc_csrf';

function sameSite(): CookieOptions['sameSite'] {
  const configured = process.env.COOKIE_SAME_SITE?.toLowerCase();
  if (configured === 'none' || configured === 'strict' || configured === 'lax') return configured;
  return 'lax';
}

function commonCookieOptions(): CookieOptions {
  const options: CookieOptions = {
    secure: process.env.NODE_ENV === 'production' || process.env.COOKIE_SECURE === 'true',
    sameSite: sameSite(),
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
  if (process.env.COOKIE_DOMAIN) options.domain = process.env.COOKIE_DOMAIN;
  return options;
}

export function setSessionCookies(res: Response, token: string): string {
  const csrfToken = crypto.randomBytes(24).toString('base64url');
  res.cookie(SESSION_COOKIE, token, { ...commonCookieOptions(), httpOnly: true });
  res.cookie(CSRF_COOKIE, csrfToken, { ...commonCookieOptions(), httpOnly: false });
  return csrfToken;
}

export function clearSessionCookies(res: Response) {
  const options = commonCookieOptions();
  res.clearCookie(SESSION_COOKIE, options);
  res.clearCookie(CSRF_COOKIE, options);
}

/** Double-submit protection for cookie-authenticated mutation requests. */
export function csrfProtection(req: Request, _res: Response, next: NextFunction) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  if (!req.cookies?.[SESSION_COOKIE]) return next();
  const cookieToken = req.cookies?.[CSRF_COOKIE];
  const headerToken = req.get('x-csrf-token');
  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return next(new AppError('Invalid CSRF token', 403));
  }
  next();
}

