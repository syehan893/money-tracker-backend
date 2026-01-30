/**
 * Authentication middleware
 * Verifies JWT tokens using Supabase Auth
 */

import type { Response, NextFunction } from 'express';
import { getSupabaseClient } from '../config/database';
import type { AuthenticatedRequest } from '../types/api.types';
import { HTTP_STATUS, ERROR_CODES } from '../config/constants';

/**
 * Middleware to authenticate requests using Supabase JWT
 * Extracts and verifies the Bearer token from Authorization header
 */
export async function authenticateUser(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: {
          code: ERROR_CODES.UNAUTHORIZED,
          message: 'Authorization header is required',
        },
      });
      return;
    }

    if (!authHeader.startsWith('Bearer ')) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: {
          code: ERROR_CODES.TOKEN_INVALID,
          message: 'Invalid authorization header format. Use: Bearer <token>',
        },
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: {
          code: ERROR_CODES.TOKEN_INVALID,
          message: 'Access token is required',
        },
      });
      return;
    }

    // Verify the token with Supabase
    const supabase = getSupabaseClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error) {
      // Handle specific Supabase auth errors
      if (error.message.includes('expired')) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: {
            code: ERROR_CODES.TOKEN_EXPIRED,
            message: 'Access token has expired',
          },
        });
        return;
      }

      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: {
          code: ERROR_CODES.TOKEN_INVALID,
          message: 'Invalid access token',
        },
      });
      return;
    }

    if (!user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: {
          code: ERROR_CODES.UNAUTHORIZED,
          message: 'User not found',
        },
      });
      return;
    }

    // Attach user and token to request
    req.user = user;
    req.accessToken = token;

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: ERROR_CODES.INTERNAL_ERROR,
        message: 'Authentication failed',
      },
    });
  }
}

/**
 * Optional authentication middleware
 * Attaches user if token is present, but doesn't block request if not
 */
export async function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.substring(7);

    if (!token) {
      next();
      return;
    }

    const supabase = getSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser(token);

    if (user) {
      req.user = user;
      req.accessToken = token;
    }

    next();
  } catch {
    // Silently continue without authentication
    next();
  }
}
