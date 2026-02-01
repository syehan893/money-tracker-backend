/**
 * Subscription Routes
 */

import { Router } from 'express';
import { subscriptionController } from '../controllers/subscription.controller';
import { authenticateUser } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createSubscriptionValidator,
  updateSubscriptionValidator,
  subscriptionIdValidator,
  subscriptionFiltersValidator,
} from '../validators/subscription.validator';
import type { AuthenticatedRequest } from '../types/api.types';

const router = Router();

// All subscription routes require authentication
router.use(authenticateUser);

/**
 * GET /api/v1/subscriptions/active
 * Get active subscriptions
 * Note: Must come before /:id
 */
router.get(
  '/active',
  subscriptionController.getActiveSubscriptions.bind(subscriptionController) as (
    req: AuthenticatedRequest,
    ...args: Parameters<typeof subscriptionController.getActiveSubscriptions>
  ) => Promise<void>
);

/**
 * GET /api/v1/subscriptions/upcoming
 * Get upcoming renewals
 * Note: Must come before /:id
 */
router.get(
  '/upcoming',
  subscriptionController.getUpcomingRenewals.bind(subscriptionController) as (
    req: AuthenticatedRequest,
    ...args: Parameters<typeof subscriptionController.getUpcomingRenewals>
  ) => Promise<void>
);

/**
 * GET /api/v1/subscriptions
 * Get all subscriptions with filters
 */
router.get(
  '/',
  validate(subscriptionFiltersValidator),
  subscriptionController.getSubscriptions.bind(subscriptionController) as (
    req: AuthenticatedRequest,
    ...args: Parameters<typeof subscriptionController.getSubscriptions>
  ) => Promise<void>
);

/**
 * GET /api/v1/subscriptions/:id
 * Get subscription by ID
 */
router.get(
  '/:id',
  validate(subscriptionIdValidator),
  subscriptionController.getSubscriptionById.bind(subscriptionController) as (
    req: AuthenticatedRequest,
    ...args: Parameters<typeof subscriptionController.getSubscriptionById>
  ) => Promise<void>
);

/**
 * POST /api/v1/subscriptions
 * Create subscription
 */
router.post(
  '/',
  validate(createSubscriptionValidator),
  subscriptionController.createSubscription.bind(subscriptionController) as (
    req: AuthenticatedRequest,
    ...args: Parameters<typeof subscriptionController.createSubscription>
  ) => Promise<void>
);

/**
 * PUT /api/v1/subscriptions/:id
 * Update subscription
 */
router.put(
  '/:id',
  validate(updateSubscriptionValidator),
  subscriptionController.updateSubscription.bind(subscriptionController) as (
    req: AuthenticatedRequest,
    ...args: Parameters<typeof subscriptionController.updateSubscription>
  ) => Promise<void>
);

/**
 * DELETE /api/v1/subscriptions/:id
 * Delete subscription
 */
router.delete(
  '/:id',
  validate(subscriptionIdValidator),
  subscriptionController.deleteSubscription.bind(subscriptionController) as (
    req: AuthenticatedRequest,
    ...args: Parameters<typeof subscriptionController.deleteSubscription>
  ) => Promise<void>
);

export default router;
