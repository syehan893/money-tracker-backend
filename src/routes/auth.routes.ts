/**
 * Auth Routes
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authController } from '../controllers/auth.controller';
import { authenticateUser } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  updateProfileValidator,
} from '../validators/auth.validator';
import { RATE_LIMITS } from '../config/constants';
import { body } from 'express-validator';

const router = Router();

// Rate limiter for auth endpoints (stricter than general)
const authLimiter = rateLimit({
  windowMs: RATE_LIMITS.AUTH.WINDOW_MS,
  max: RATE_LIMITS.AUTH.MAX_REQUESTS,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many authentication attempts. Please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes (no authentication required)

/**
 * POST /api/v1/auth/register
 * Register a new user
 */
router.post(
  '/register',
  authLimiter,
  validate(registerValidator),
  authController.register.bind(authController)
);

/**
 * POST /api/v1/auth/login
 * Login a user
 */
router.post(
  '/login',
  authLimiter,
  validate(loginValidator),
  authController.login.bind(authController)
);

/**
 * POST /api/v1/auth/forgot-password
 * Request password reset email
 */
router.post(
  '/forgot-password',
  authLimiter,
  validate(forgotPasswordValidator),
  authController.forgotPassword.bind(authController)
);

/**
 * POST /api/v1/auth/reset-password
 * Reset password with token
 */
router.post(
  '/reset-password',
  authLimiter,
  validate(resetPasswordValidator),
  authController.resetPassword.bind(authController)
);

/**
 * POST /api/v1/auth/refresh
 * Refresh access token
 */
router.post(
  '/refresh',
  validate([body('refreshToken').notEmpty().withMessage('Refresh token is required')]),
  authController.refreshToken.bind(authController)
);

// Protected routes (authentication required)

/**
 * POST /api/v1/auth/logout
 * Logout current user
 */
router.post('/logout', authenticateUser, authController.logout.bind(authController));

/**
 * GET /api/v1/auth/me
 * Get current user profile
 */
router.get('/me', authenticateUser, authController.getCurrentUser.bind(authController));

/**
 * PUT /api/v1/auth/profile
 * Update current user profile
 */
router.put(
  '/profile',
  authenticateUser,
  validate(updateProfileValidator),
  authController.updateProfile.bind(authController)
);

export default router;
