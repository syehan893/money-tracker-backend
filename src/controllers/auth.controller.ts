/**
 * Auth Controller
 * Handles HTTP requests for authentication endpoints
 */

import type { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/response.util';
import type { AuthenticatedRequest } from '../types/api.types';

export class AuthController {
  /**
   * POST /api/v1/auth/register
   * Register a new user
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, fullName } = req.body as {
        email: string;
        password: string;
        fullName?: string;
      };

      const result = await authService.register({ email, password, fullName });

      sendCreated(res, result, 'Registration successful');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/login
   * Login a user
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body as {
        email: string;
        password: string;
      };

      const result = await authService.login({ email, password });

      sendSuccess(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/logout
   * Logout current user
   */
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { accessToken } = req as AuthenticatedRequest;

      await authService.logout(accessToken);

      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/auth/me
   * Get current user profile
   */
  async getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user } = req as AuthenticatedRequest;

      const profile = await authService.getCurrentUser(user.id);

      sendSuccess(res, {
        id: profile.id,
        email: profile.email,
        fullName: profile.full_name,
        avatarUrl: profile.avatar_url,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/auth/profile
   * Update current user profile
   */
  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user, accessToken } = req as AuthenticatedRequest;
      const { fullName, avatarUrl } = req.body as {
        fullName?: string;
        avatarUrl?: string;
      };

      const profile = await authService.updateProfile(
        user.id,
        { fullName, avatarUrl },
        accessToken
      );

      sendSuccess(
        res,
        {
          id: profile.id,
          email: profile.email,
          fullName: profile.full_name,
          avatarUrl: profile.avatar_url,
          createdAt: profile.created_at,
          updatedAt: profile.updated_at,
        },
        'Profile updated successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/forgot-password
   * Request password reset email
   */
  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body as { email: string };

      await authService.forgotPassword({ email });

      // Always return success to prevent email enumeration
      sendSuccess(
        res,
        null,
        'If an account exists with this email, a password reset link has been sent'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/reset-password
   * Reset password with token
   */
  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, password } = req.body as {
        token: string;
        password: string;
      };

      await authService.resetPassword({ token, password });

      sendSuccess(res, null, 'Password has been reset successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/refresh
   * Refresh access token
   */
  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body as { refreshToken: string };

      const result = await authService.refreshToken(refreshToken);

      sendSuccess(res, result, 'Token refreshed successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
