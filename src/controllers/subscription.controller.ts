/**
 * Subscription Controller
 * Handles HTTP requests for subscription management endpoints
 */

import type { Response, NextFunction } from 'express';
import { subscriptionService } from '../services/subscription.service';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/response.util';
import type {
  AuthenticatedRequest,
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
} from '../types/api.types';
import type { BillingCycle } from '../types/database.types';

export class SubscriptionController {
  /**
   * GET /api/v1/subscriptions
   * Get all subscriptions with filters and pagination
   */
  async getSubscriptions(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { user, accessToken } = req;
      const { accountId, isActive, billingCycle, page, limit } = req.query as {
        accountId?: string;
        isActive?: string;
        billingCycle?: string;
        page?: string;
        limit?: string;
      };

      const result = await subscriptionService.getSubscriptions(user.id, accessToken, {
        accountId,
        isActive: isActive !== undefined ? isActive === 'true' : undefined,
        billingCycle: billingCycle as BillingCycle | undefined,
        page: page ? parseInt(page, 10) : undefined,
        limit: limit ? parseInt(limit, 10) : undefined,
      });

      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/subscriptions/:id
   * Get subscription by ID
   */
  async getSubscriptionById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { user, accessToken } = req;
      const { id } = req.params;

      const subscription = await subscriptionService.getSubscriptionById(user.id, id, accessToken);

      sendSuccess(res, subscription);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/subscriptions
   * Create subscription
   */
  async createSubscription(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { user, accessToken } = req;
      const { accountId, name, amount, billingCycle, nextBillingDate, description } =
        req.body as CreateSubscriptionDto;

      const subscription = await subscriptionService.createSubscription(
        user.id,
        { accountId, name, amount, billingCycle, nextBillingDate, description },
        accessToken
      );

      sendCreated(res, subscription, 'Subscription created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/subscriptions/:id
   * Update subscription
   */
  async updateSubscription(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { user, accessToken } = req;
      const { id } = req.params;
      const { accountId, name, amount, billingCycle, nextBillingDate, description, isActive } =
        req.body as UpdateSubscriptionDto;

      const subscription = await subscriptionService.updateSubscription(
        user.id,
        id,
        { accountId, name, amount, billingCycle, nextBillingDate, description, isActive },
        accessToken
      );

      sendSuccess(res, subscription, 'Subscription updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/subscriptions/:id
   * Delete subscription
   */
  async deleteSubscription(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { user, accessToken } = req;
      const { id } = req.params;

      await subscriptionService.deleteSubscription(user.id, id, accessToken);

      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/subscriptions/active
   * Get active subscriptions
   */
  async getActiveSubscriptions(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { user, accessToken } = req;

      const subscriptions = await subscriptionService.getActiveSubscriptions(user.id, accessToken);

      sendSuccess(res, subscriptions);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/subscriptions/upcoming
   * Get upcoming renewals
   */
  async getUpcomingRenewals(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { user, accessToken } = req;
      const { days } = req.query as { days?: string };

      const subscriptions = await subscriptionService.getUpcomingRenewals(
        user.id,
        accessToken,
        days ? parseInt(days, 10) : 7
      );

      sendSuccess(res, subscriptions);
    } catch (error) {
      next(error);
    }
  }
}

export const subscriptionController = new SubscriptionController();
