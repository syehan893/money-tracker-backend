/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access */
/**
 * Account Repository
 * Handles database operations for accounts
 */

import { getSupabaseClientWithAuth } from '../config/database';
import type { Account, AccountInsert, AccountUpdate, AccountType } from '../types/database.types';
import { parseSupabaseError, NotFoundError } from '../middleware/error.middleware';

export interface AccountFilters {
  type?: AccountType;
  isActive?: boolean;
}

export class AccountRepository {
  /**
   * Get all accounts for a user with optional filters
   */
  async findAll(userId: string, accessToken: string, filters?: AccountFilters): Promise<Account[]> {
    const supabase = getSupabaseClientWithAuth(accessToken);

    let query = supabase
      .from('accounts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (filters?.type) {
      query = query.eq('account_type', filters.type);
    }

    if (filters?.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }

    const { data, error } = await query;

    if (error) {
      throw parseSupabaseError(error);
    }

    return data || [];
  }

  /**
   * Get account by ID
   */
  async findById(userId: string, accountId: string, accessToken: string): Promise<Account | null> {
    const supabase = getSupabaseClientWithAuth(accessToken);

    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', accountId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw parseSupabaseError(error);
    }

    return data;
  }

  /**
   * Create a new account
   */
  async create(
    userId: string,
    data: Omit<AccountInsert, 'id' | 'user_id'>,
    accessToken: string
  ): Promise<Account> {
    const supabase = getSupabaseClientWithAuth(accessToken);

    const { data: account, error } = await supabase
      .from('accounts')
      .insert({
        ...data,
        user_id: userId,
      } as any)
      .select()
      .single();

    if (error) {
      throw parseSupabaseError(error);
    }

    if (!account) {
      throw new Error('Failed to create account');
    }

    return account;
  }

  /**
   * Update an account
   */
  async update(
    userId: string,
    accountId: string,
    data: AccountUpdate,
    accessToken: string
  ): Promise<Account> {
    const supabase = getSupabaseClientWithAuth(accessToken);

    const { data: account, error } = await supabase
      .from('accounts')
      .update(data as unknown as never)
      .eq('id', accountId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundError('Account', accountId);
      }
      throw parseSupabaseError(error);
    }

    if (!account) {
      throw new NotFoundError('Account', accountId);
    }

    return account;
  }

  /**
   * Delete an account (soft delete by setting is_active to false)
   */
  async delete(userId: string, accountId: string, accessToken: string): Promise<void> {
    const supabase = getSupabaseClientWithAuth(accessToken);

    const { error } = await supabase
      .from('accounts')
      .update({ is_active: false } as unknown as never)
      .eq('id', accountId)
      .eq('user_id', userId);

    if (error) {
      throw parseSupabaseError(error);
    }
  }

  /**
   * Get accounts summary by type
   */
  async getSummary(
    userId: string,
    accessToken: string
  ): Promise<{
    totalBalance: number;
    accountsByType: { type: AccountType; count: number; totalBalance: number }[];
  }> {
    const supabase = getSupabaseClientWithAuth(accessToken);

    // Get all active accounts for the user
    const { data: accounts, error } = await supabase
      .from('accounts')
      .select('account_type, balance')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) {
      throw parseSupabaseError(error);
    }

    // Calculate summary
    const summary: Record<AccountType, { count: number; totalBalance: number }> = {
      saving: { count: 0, totalBalance: 0 },
      spending: { count: 0, totalBalance: 0 },
      wallet: { count: 0, totalBalance: 0 },
      investment: { count: 0, totalBalance: 0 },
      business: { count: 0, totalBalance: 0 },
    };

    let totalBalance = 0;

    for (const account of (accounts || []) as any[]) {
      const type = account.account_type as AccountType;
      summary[type].count += 1;
      summary[type].totalBalance += Number(account.balance);
      totalBalance += Number(account.balance);
    }

    return {
      totalBalance,
      accountsByType: Object.entries(summary).map(([type, data]) => ({
        type: type as AccountType,
        ...data,
      })),
    };
  }

  /**
   * Check if account exists and is active
   */
  async isAccountActiveAndOwned(
    userId: string,
    accountId: string,
    accessToken: string
  ): Promise<boolean> {
    const account = await this.findById(userId, accountId, accessToken);
    return account !== null && account.is_active;
  }

  /**
   * Get account balance
   */
  async getBalance(userId: string, accountId: string, accessToken: string): Promise<number | null> {
    const account = await this.findById(userId, accountId, accessToken);
    return account ? Number(account.balance) : null;
  }
}

export const accountRepository = new AccountRepository();
