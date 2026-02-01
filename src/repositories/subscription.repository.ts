/**
 * Subscription Repository
 * Handles database operations for subscriptions
 */

import { getSupabaseClientWithAuth } from '../config/database';
import type {
  SubscriptionInsert,
  SubscriptionUpdate,
  SubscriptionWithRelations,
  BillingCycle,
} from '../types/database.types';
import { parseSupabaseError, NotFoundError } from '../middleware/error.middleware';

export interface SubscriptionFilters {
  accountId?: string;
  isActive?: boolean;
  billingCycle?: BillingCycle;
}

export class SubscriptionRepository {
  /**
   * Get all subscriptions for a user with optional filters
   */
  async findAll(
    userId: string,
    accessToken: string,
    filters?: SubscriptionFilters,
    offset?: number,
    limit?: number
  ): Promise<{ subscriptions: SubscriptionWithRelations[]; total: number }> {
    const supabase = getSupabaseClientWithAuth(accessToken);

    let query = supabase
      .from('subscriptions')
      .select(
        `
        *,
        account:accounts(id, name, account_type)
      `,
        { count: 'exact' }
      )
      .eq('user_id', userId);

    if (filters?.accountId) {
      query = query.eq('account_id', filters.accountId);
    }

    if (filters?.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }

    if (filters?.billingCycle) {
      query = query.eq('billing_cycle', filters.billingCycle);
    }

    query = query.order('next_billing_date', { ascending: true });

    if (offset !== undefined && limit !== undefined) {
      query = query.range(offset, offset + limit - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      throw parseSupabaseError(error);
    }

    return {
      subscriptions: (data || []) as SubscriptionWithRelations[],
      total: count || 0,
    };
  }

  /**
   * Get subscription by ID
   */
  async findById(
    userId: string,
    subscriptionId: string,
    accessToken: string
  ): Promise<SubscriptionWithRelations | null> {
    const supabase = getSupabaseClientWithAuth(accessToken);

    const { data, error } = await supabase
      .from('subscriptions')
      .select(
        `
        *,
        account:accounts(id, name, account_type)
      `
      )
      .eq('id', subscriptionId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw parseSupabaseError(error);
    }

    return data as SubscriptionWithRelations;
  }

  /**
   * Create a new subscription
   */
  async create(
    userId: string,
    data: Omit<SubscriptionInsert, 'id' | 'user_id'>,
    accessToken: string
  ): Promise<SubscriptionWithRelations> {
    const supabase = getSupabaseClientWithAuth(accessToken);

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .insert({
        ...data,
        user_id: userId,
      })
      .select(
        `
        *,
        account:accounts(id, name, account_type)
      `
      )
      .single();

    if (error) {
      throw parseSupabaseError(error);
    }

    if (!subscription) {
      throw new Error('Failed to create subscription');
    }

    return subscription as SubscriptionWithRelations;
  }

  /**
   * Update a subscription
   */
  async update(
    userId: string,
    subscriptionId: string,
    data: SubscriptionUpdate,
    accessToken: string
  ): Promise<SubscriptionWithRelations> {
    const supabase = getSupabaseClientWithAuth(accessToken);

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .update(data)
      .eq('id', subscriptionId)
      .eq('user_id', userId)
      .select(
        `
        *,
        account:accounts(id, name, account_type)
      `
      )
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundError('Subscription', subscriptionId);
      }
      throw parseSupabaseError(error);
    }

    if (!subscription) {
      throw new NotFoundError('Subscription', subscriptionId);
    }

    return subscription as SubscriptionWithRelations;
  }

  /**
   * Delete a subscription
   */
  async delete(userId: string, subscriptionId: string, accessToken: string): Promise<void> {
    const supabase = getSupabaseClientWithAuth(accessToken);

    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('id', subscriptionId)
      .eq('user_id', userId);

    if (error) {
      throw parseSupabaseError(error);
    }
  }

  /**
   * Get active subscriptions
   */
  async findActive(userId: string, accessToken: string): Promise<SubscriptionWithRelations[]> {
    const { subscriptions } = await this.findAll(userId, accessToken, { isActive: true });
    return subscriptions;
  }

  /**
   * Get upcoming renewals within N days
   */
  async findUpcoming(
    userId: string,
    accessToken: string,
    days: number = 7
  ): Promise<SubscriptionWithRelations[]> {
    const supabase = getSupabaseClientWithAuth(accessToken);

    const today = new Date().toISOString().split('T')[0];
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    const futureDateStr = futureDate.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('subscriptions')
      .select(
        `
        *,
        account:accounts(id, name, account_type)
      `
      )
      .eq('user_id', userId)
      .eq('is_active', true)
      .gte('next_billing_date', today)
      .lte('next_billing_date', futureDateStr)
      .order('next_billing_date', { ascending: true });

    if (error) {
      throw parseSupabaseError(error);
    }

    return (data || []) as SubscriptionWithRelations[];
  }

  /**
   * Get total monthly subscription cost
   */
  async getTotalMonthlyCost(userId: string, accessToken: string): Promise<number> {
    const activeSubscriptions = await this.findActive(userId, accessToken);

    let totalMonthlyCost = 0;

    for (const sub of activeSubscriptions) {
      const amount = Number(sub.amount);
      switch (sub.billing_cycle) {
        case 'weekly':
          totalMonthlyCost += amount * 4.33; // Average weeks per month
          break;
        case 'monthly':
          totalMonthlyCost += amount;
          break;
        case 'quarterly':
          totalMonthlyCost += amount / 3;
          break;
        case 'yearly':
          totalMonthlyCost += amount / 12;
          break;
      }
    }

    return Math.round(totalMonthlyCost * 100) / 100;
  }
}

export const subscriptionRepository = new SubscriptionRepository();
