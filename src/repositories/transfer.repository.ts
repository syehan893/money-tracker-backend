/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access */
/**
 * Transfer Repository
 * Handles database operations for transfers
 */

import { getSupabaseClientWithAuth } from '../config/database';
import type { TransferInsert, TransferWithRelations } from '../types/database.types';
import { parseSupabaseError } from '../middleware/error.middleware';

export interface TransferFilters {
  accountId?: string;
  startDate?: string;
  endDate?: string;
}

export class TransferRepository {
  /**
   * Get all transfers for a user with optional filters
   */
  async findAll(
    userId: string,
    accessToken: string,
    filters?: TransferFilters,
    offset?: number,
    limit?: number
  ): Promise<{ transfers: TransferWithRelations[]; total: number }> {
    const supabase = getSupabaseClientWithAuth(accessToken);

    let query = supabase
      .from('transfers')
      .select(
        `
        *,
        from_account:accounts!transfers_from_account_id_fkey(id, name, account_type),
        to_account:accounts!transfers_to_account_id_fkey(id, name, account_type)
      `,
        { count: 'exact' }
      )
      .eq('user_id', userId);

    // Filter by account (either source or destination)
    if (filters?.accountId) {
      query = query.or(
        `from_account_id.eq.${filters.accountId},to_account_id.eq.${filters.accountId}`
      );
    }

    if (filters?.startDate) {
      query = query.gte('date', filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte('date', filters.endDate);
    }

    query = query.order('date', { ascending: false });

    if (offset !== undefined && limit !== undefined) {
      query = query.range(offset, offset + limit - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      throw parseSupabaseError(error);
    }

    return {
      transfers: (data || []) as TransferWithRelations[],
      total: count || 0,
    };
  }

  /**
   * Get transfer by ID
   */
  async findById(
    userId: string,
    transferId: string,
    accessToken: string
  ): Promise<TransferWithRelations | null> {
    const supabase = getSupabaseClientWithAuth(accessToken);

    const { data, error } = await supabase
      .from('transfers')
      .select(
        `
        *,
        from_account:accounts!transfers_from_account_id_fkey(id, name, account_type),
        to_account:accounts!transfers_to_account_id_fkey(id, name, account_type)
      `
      )
      .eq('id', transferId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw parseSupabaseError(error);
    }

    return data as TransferWithRelations;
  }

  /**
   * Create a new transfer
   */
  async create(
    userId: string,
    data: Omit<TransferInsert, 'id' | 'user_id'>,
    accessToken: string
  ): Promise<TransferWithRelations> {
    const supabase = getSupabaseClientWithAuth(accessToken);

    const { data: transfer, error } = await supabase
      .from('transfers')
      .insert({
        ...data,
        user_id: userId,
      } as any)
      .select(
        `
        *,
        from_account:accounts!transfers_from_account_id_fkey(id, name, account_type),
        to_account:accounts!transfers_to_account_id_fkey(id, name, account_type)
      `
      )
      .single();

    if (error) {
      throw parseSupabaseError(error);
    }

    if (!transfer) {
      throw new Error('Failed to create transfer');
    }

    return transfer as TransferWithRelations;
  }

  /**
   * Delete a transfer
   * Note: Transfers cannot be updated, only deleted
   */
  async delete(userId: string, transferId: string, accessToken: string): Promise<void> {
    const supabase = getSupabaseClientWithAuth(accessToken);

    const { error } = await supabase
      .from('transfers')
      .delete()
      .eq('id', transferId)
      .eq('user_id', userId);

    if (error) {
      throw parseSupabaseError(error);
    }
  }
}

export const transferRepository = new TransferRepository();
