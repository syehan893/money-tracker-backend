/**
 * HTTP Request logging middleware using Morgan
 */

import morgan from 'morgan';
import type { Request, Response } from 'express';
import { isProduction } from '../config/env';

// Custom morgan token for user ID
morgan.token('user-id', (req: Request) => {
  const authReq = req as Request & { user?: { id?: string } };
  return authReq.user?.id || 'anonymous';
});

// Custom morgan token for response time in a readable format
morgan.token('response-time-ms', (_req: Request, res: Response) => {
  const responseTime = res.getHeader('X-Response-Time');
  return responseTime ? `${String(responseTime)}` : '-';
});

/**
 * Development format: Detailed, colorized output
 */
const developmentFormat =
  ':method :url :status :response-time ms - :res[content-length] bytes - user::user-id';

/**
 * Production format: JSON structured logging
 */
const productionFormat = JSON.stringify({
  method: ':method',
  url: ':url',
  status: ':status',
  responseTime: ':response-time',
  contentLength: ':res[content-length]',
  userAgent: ':user-agent',
  userId: ':user-id',
  remoteAddr: ':remote-addr',
  timestamp: ':date[iso]',
});

/**
 * Get the appropriate morgan format based on environment
 */
export function getLoggerFormat(): string {
  return isProduction ? productionFormat : developmentFormat;
}

/**
 * Create morgan middleware with appropriate format
 */
export const httpLogger = morgan(getLoggerFormat(), {
  // Skip logging for health check endpoints to reduce noise
  skip: (req: Request) => {
    return req.url === '/api/health' || req.url === '/health';
  },
});

/**
 * Create morgan middleware for error logging only
 */
export const errorLogger = morgan(getLoggerFormat(), {
  skip: (_req: Request, res: Response) => res.statusCode < 400,
});
