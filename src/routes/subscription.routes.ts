/**
 * Subscription Routes
 */

import { Router } from 'express';
import { subscriptionController } from '../controllers/subscription.controller';
import { authenticateUser } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import {
  createSubscriptionValidator,
  updateSubscriptionValidator,
  subscriptionIdValidator,
  subscriptionFiltersValidator,
} from '../validators/subscription.validator';

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
  asyncHandler(subscriptionController.getActiveSubscriptions.bind(subscriptionController))
);

/**
 * GET /api/v1/subscriptions/upcoming
 * Get upcoming renewals
 * Note: Must come before /:id
 */
router.get(
  '/upcoming',
  asyncHandler(subscriptionController.getUpcomingRenewals.bind(subscriptionController))
);

/**
 * GET /api/v1/subscriptions
 * Get all subscriptions with filters
 */
router.get(
  '/',
  validate(subscriptionFiltersValidator),
  asyncHandler(subscriptionController.getSubscriptions.bind(subscriptionController))
);

/**
 * GET /api/v1/subscriptions/:id
 * Get subscription by ID
 */
router.get(
  '/:id',
  validate(subscriptionIdValidator),
  asyncHandler(subscriptionController.getSubscriptionById.bind(subscriptionController))
);

/**
 * POST /api/v1/subscriptions
 * Create subscription
 */
router.post(
  '/',
  validate(createSubscriptionValidator),
  asyncHandler(subscriptionController.createSubscription.bind(subscriptionController))
);

/**
 * PUT /api/v1/subscriptions/:id
 * Update subscription
 */
router.put(
  '/:id',
  validate(updateSubscriptionValidator),
  asyncHandler(subscriptionController.updateSubscription.bind(subscriptionController))
);

/**
 * DELETE /api/v1/subscriptions/:id
 * Delete subscription
 */
router.delete(
  '/:id',
  validate(subscriptionIdValidator),
  asyncHandler(subscriptionController.deleteSubscription.bind(subscriptionController))
);

export default router;
