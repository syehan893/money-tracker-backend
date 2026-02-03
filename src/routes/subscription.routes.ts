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
 * @swagger
 * tags:
 *   name: Subscriptions
 *   description: Subscription management
 */

/**
 * @swagger
 * /subscriptions/active:
 *   get:
 *     summary: Get active subscriptions
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of active subscriptions
 */
router.get(
  '/active',
  asyncHandler(subscriptionController.getActiveSubscriptions.bind(subscriptionController))
);

/**
 * @swagger
 * /subscriptions/upcoming:
 *   get:
 *     summary: Get upcoming renewals
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of upcoming renewals
 */
router.get(
  '/upcoming',
  asyncHandler(subscriptionController.getUpcomingRenewals.bind(subscriptionController))
);

/**
 * @swagger
 * /subscriptions:
 *   get:
 *     summary: Get all subscriptions
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of subscriptions
 */
router.get(
  '/',
  validate(subscriptionFiltersValidator),
  asyncHandler(subscriptionController.getSubscriptions.bind(subscriptionController))
);

/**
 * @swagger
 * /subscriptions/{id}:
 *   get:
 *     summary: Get subscription by ID
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Subscription details
 */
router.get(
  '/:id',
  validate(subscriptionIdValidator),
  asyncHandler(subscriptionController.getSubscriptionById.bind(subscriptionController))
);

/**
 * @swagger
 * /subscriptions:
 *   post:
 *     summary: Create subscription
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - amount
 *               - billing_cycle
 *               - next_billing_date
 *             properties:
 *               name:
 *                 type: string
 *               amount:
 *                 type: number
 *               billing_cycle:
 *                 type: string
 *                 enum: [MONTHLY, YEARLY, WEEKLY]
 *               next_billing_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Subscription created
 */
router.post(
  '/',
  validate(createSubscriptionValidator),
  asyncHandler(subscriptionController.createSubscription.bind(subscriptionController))
);

/**
 * @swagger
 * /subscriptions/{id}:
 *   put:
 *     summary: Update subscription
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               amount:
 *                 type: number
 *               billing_cycle:
 *                 type: string
 *               next_billing_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Subscription updated
 */
router.put(
  '/:id',
  validate(updateSubscriptionValidator),
  asyncHandler(subscriptionController.updateSubscription.bind(subscriptionController))
);

/**
 * @swagger
 * /subscriptions/{id}:
 *   delete:
 *     summary: Delete subscription
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Subscription deleted
 */
router.delete(
  '/:id',
  validate(subscriptionIdValidator),
  asyncHandler(subscriptionController.deleteSubscription.bind(subscriptionController))
);

export default router;
