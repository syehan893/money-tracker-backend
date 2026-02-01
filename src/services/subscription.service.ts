/**
 * Subscription Service
 * Handles business logic for subscription management
 */

import {
  subscriptionRepository,
  type SubscriptionFilters,
} from '../repositories/subscription.repository';
import { accountService } from './account.service';
import { NotFoundError, ValidationError } from '../middleware/error.middleware';
import type {
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
  PaginatedResponse,
} from '../types/api.types';
import type { SubscriptionWithRelations, BillingCycle } from '../types/database.types';
import { parsePaginationParams } from '../utils/validation.util';

export class SubscriptionService {
  /**
   * Get all subscriptions with filters and pagination
   */
  async getSubscriptions(
    userId: string,
    accessToken: string,
    filters?: SubscriptionFilters & { page?: number; limit?: number }
  ): Promise<PaginatedResponse<SubscriptionWithRelations>> {
    const { page, limit, offset } = parsePaginationParams(
      filters?.page,
      filters?.limit
    );

    const { subscriptions, total } = await subscriptionRepository.findAll(
      userId,
      accessToken,
      {
        accountId: filters?.accountId,
        isActive: filters?.isActive,
        billingCycle: filters?.billingCycle,
      },
      offset,
      limit
    );

    return {
      items: subscriptions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    };
  }

  /**
   * Get subscription by ID
   */
  async getSubscriptionById(
    userId: string,
    subscriptionId: string,
    accessToken: string
  ): Promise<SubscriptionWithRelations> {
    const subscription = await subscriptionRepository.findById(
      userId,
      subscriptionId,
      accessToken
    );

    if (!subscription) {
      throw new NotFoundError('Subscription', subscriptionId);
    }

    return subscription;
  }

  /**
   * Create a new subscription
   */
  async createSubscription(
    userId: string,
    data: CreateSubscriptionDto,
    accessToken: string
  ): Promise<SubscriptionWithRelations> {
    const { accountId, name, amount, billingCycle, nextBillingDate, description } = data;

    // Validate account exists and belongs to user
    await accountService.validateAccountOwnership(userId, accountId, accessToken);

    // Amount validation
    if (amount <= 0) {
      throw new ValidationError('Amount must be a positive number');
    }

    return subscriptionRepository.create(
      userId,
      {
        account_id: accountId,
        name,
        amount,
        billing_cycle: billingCycle as BillingCycle,
        next_billing_date: nextBillingDate,
        description: description || null,
      },
      accessToken
    );
  }

  /**
   * Update a subscription
   */
  async updateSubscription(
    userId: string,
    subscriptionId: string,
    data: UpdateSubscriptionDto,
    accessToken: string
  ): Promise<SubscriptionWithRelations> {
    // Check if subscription exists
    const existing = await subscriptionRepository.findById(userId, subscriptionId, accessToken);
    if (!existing) {
      throw new NotFoundError('Subscription', subscriptionId);
    }

    // Validate account if changing
    if (data.accountId && data.accountId !== existing.account_id) {
      await accountService.validateAccountOwnership(userId, data.accountId, accessToken);
    }

    // Amount validation
    if (data.amount !== undefined && data.amount <= 0) {
      throw new ValidationError('Amount must be a positive number');
    }

    const updateData: {
      account_id?: string;
      name?: string;
      amount?: number;
      billing_cycle?: BillingCycle;
      next_billing_date?: string;
      description?: string | null;
      is_active?: boolean;
    } = {};

    if (data.accountId !== undefined) {
      updateData.account_id = data.accountId;
    }

    if (data.name !== undefined) {
      updateData.name = data.name;
    }

    if (data.amount !== undefined) {
      updateData.amount = data.amount;
    }

    if (data.billingCycle !== undefined) {
      updateData.billing_cycle = data.billingCycle as BillingCycle;
    }

    if (data.nextBillingDate !== undefined) {
      updateData.next_billing_date = data.nextBillingDate;
    }

    if (data.description !== undefined) {
      updateData.description = data.description;
    }

    if (data.isActive !== undefined) {
      updateData.is_active = data.isActive;
    }

    return subscriptionRepository.update(userId, subscriptionId, updateData, accessToken);
  }

  /**
   * Delete a subscription
   */
  async deleteSubscription(
    userId: string,
    subscriptionId: string,
    accessToken: string
  ): Promise<void> {
    // Check if subscription exists
    const existing = await subscriptionRepository.findById(userId, subscriptionId, accessToken);
    if (!existing) {
      throw new NotFoundError('Subscription', subscriptionId);
    }

    await subscriptionRepository.delete(userId, subscriptionId, accessToken);
  }

  /**
   * Get active subscriptions
   */
  async getActiveSubscriptions(
    userId: string,
    accessToken: string
  ): Promise<SubscriptionWithRelations[]> {
    return subscriptionRepository.findActive(userId, accessToken);
  }

  /**
   * Get upcoming renewals
   */
  async getUpcomingRenewals(
    userId: string,
    accessToken: string,
    days: number = 7
  ): Promise<SubscriptionWithRelations[]> {
    return subscriptionRepository.findUpcoming(userId, accessToken, days);
  }

  /**
   * Get total monthly subscription cost
   */
  async getTotalMonthlyCost(userId: string, accessToken: string): Promise<number> {
    return subscriptionRepository.getTotalMonthlyCost(userId, accessToken);
  }
}

export const subscriptionService = new SubscriptionService();
