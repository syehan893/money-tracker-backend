/**
 * Income and Income Type Repositories
 * Handles database operations for incomes and income types
 */

import { getSupabaseClientWithAuth } from '../config/database';
import type {
  IncomeType,
  IncomeTypeInsert,
  IncomeTypeUpdate,
  IncomeInsert,
  IncomeUpdate,
  IncomeWithRelations,
} from '../types/database.types';
import { parseSupabaseError, NotFoundError } from '../middleware/error.middleware';

// ============================================
// INCOME TYPE REPOSITORY
// ============================================

export class IncomeTypeRepository {
  /**
   * Get all income types for a user
   */
  async findAll(userId: string, accessToken: string): Promise<IncomeType[]> {
    const supabase = getSupabaseClientWithAuth(accessToken);

    const { data, error } = await supabase
      .from('income_types')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true });

    if (error) {
      throw parseSupabaseError(error);
    }

    return data || [];
  }

  /**
   * Get income type by ID
   */
  async findById(
    userId: string,
    incomeTypeId: string,
    accessToken: string
  ): Promise<IncomeType | null> {
    const supabase = getSupabaseClientWithAuth(accessToken);

    const { data, error } = await supabase
      .from('income_types')
      .select('*')
      .eq('id', incomeTypeId)
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
   * Create a new income type
   */
  async create(
    userId: string,
    data: Omit<IncomeTypeInsert, 'id' | 'user_id'>,
    accessToken: string
  ): Promise<IncomeType> {
    const supabase = getSupabaseClientWithAuth(accessToken);

    const { data: incomeType, error } = await supabase
      .from('income_types')
      .insert({
        ...data,
        user_id: userId,
      })
      .select()
      .single();

    if (error) {
      throw parseSupabaseError(error);
    }

    if (!incomeType) {
      throw new Error('Failed to create income type');
    }

    return incomeType;
  }

  /**
   * Update an income type
   */
  async update(
    userId: string,
    incomeTypeId: string,
    data: IncomeTypeUpdate,
    accessToken: string
  ): Promise<IncomeType> {
    const supabase = getSupabaseClientWithAuth(accessToken);

    const { data: incomeType, error } = await supabase
      .from('income_types')
      .update(data)
      .eq('id', incomeTypeId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundError('Income type', incomeTypeId);
      }
      throw parseSupabaseError(error);
    }

    if (!incomeType) {
      throw new NotFoundError('Income type', incomeTypeId);
    }

    return incomeType;
  }

  /**
   * Delete an income type
   */
  async delete(userId: string, incomeTypeId: string, accessToken: string): Promise<void> {
    const supabase = getSupabaseClientWithAuth(accessToken);

    const { error } = await supabase
      .from('income_types')
      .delete()
      .eq('id', incomeTypeId)
      .eq('user_id', userId);

    if (error) {
      throw parseSupabaseError(error);
    }
  }
}

// ============================================
// INCOME REPOSITORY
// ============================================

export interface IncomeFilters {
  accountId?: string;
  incomeTypeId?: string;
  startDate?: string;
  endDate?: string;
}

export class IncomeRepository {
  /**
   * Get all incomes for a user with optional filters
   */
  async findAll(
    userId: string,
    accessToken: string,
    filters?: IncomeFilters,
    offset?: number,
    limit?: number
  ): Promise<{ incomes: IncomeWithRelations[]; total: number }> {
    const supabase = getSupabaseClientWithAuth(accessToken);

    let query = supabase
      .from('incomes')
      .select(
        `
        *,
        account:accounts(id, name, account_type),
        income_type:income_types(id, name, target_amount)
      `,
        { count: 'exact' }
      )
      .eq('user_id', userId);

    if (filters?.accountId) {
      query = query.eq('account_id', filters.accountId);
    }

    if (filters?.incomeTypeId) {
      query = query.eq('income_type_id', filters.incomeTypeId);
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
      incomes: (data || []) as IncomeWithRelations[],
      total: count || 0,
    };
  }

  /**
   * Get income by ID
   */
  async findById(
    userId: string,
    incomeId: string,
    accessToken: string
  ): Promise<IncomeWithRelations | null> {
    const supabase = getSupabaseClientWithAuth(accessToken);

    const { data, error } = await supabase
      .from('incomes')
      .select(
        `
        *,
        account:accounts(id, name, account_type),
        income_type:income_types(id, name, target_amount)
      `
      )
      .eq('id', incomeId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw parseSupabaseError(error);
    }

    return data as IncomeWithRelations;
  }

  /**
   * Create a new income
   */
  async create(
    userId: string,
    data: Omit<IncomeInsert, 'id' | 'user_id'>,
    accessToken: string
  ): Promise<IncomeWithRelations> {
    const supabase = getSupabaseClientWithAuth(accessToken);

    const { data: income, error } = await supabase
      .from('incomes')
      .insert({
        ...data,
        user_id: userId,
      })
      .select(
        `
        *,
        account:accounts(id, name, account_type),
        income_type:income_types(id, name, target_amount)
      `
      )
      .single();

    if (error) {
      throw parseSupabaseError(error);
    }

    if (!income) {
      throw new Error('Failed to create income');
    }

    return income as IncomeWithRelations;
  }

  /**
   * Update an income
   */
  async update(
    userId: string,
    incomeId: string,
    data: IncomeUpdate,
    accessToken: string
  ): Promise<IncomeWithRelations> {
    const supabase = getSupabaseClientWithAuth(accessToken);

    const { data: income, error } = await supabase
      .from('incomes')
      .update(data)
      .eq('id', incomeId)
      .eq('user_id', userId)
      .select(
        `
        *,
        account:accounts(id, name, account_type),
        income_type:income_types(id, name, target_amount)
      `
      )
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundError('Income', incomeId);
      }
      throw parseSupabaseError(error);
    }

    if (!income) {
      throw new NotFoundError('Income', incomeId);
    }

    return income as IncomeWithRelations;
  }

  /**
   * Delete an income
   */
  async delete(userId: string, incomeId: string, accessToken: string): Promise<void> {
    const supabase = getSupabaseClientWithAuth(accessToken);

    const { error } = await supabase
      .from('incomes')
      .delete()
      .eq('id', incomeId)
      .eq('user_id', userId);

    if (error) {
      throw parseSupabaseError(error);
    }
  }

  /**
   * Get monthly income summary
   */
  async getMonthlySummary(
    userId: string,
    year: number,
    month: number,
    accessToken: string
  ): Promise<{
    totalAmount: number;
    byType: { typeId: string; typeName: string; amount: number; target: number | null }[];
  }> {
    const supabase = getSupabaseClientWithAuth(accessToken);

    // Get all incomes for the month with their types
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    const { data: incomes, error } = await supabase
      .from('incomes')
      .select(
        `
        amount,
        income_type:income_types(id, name, target_amount)
      `
      )
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate);

    if (error) {
      throw parseSupabaseError(error);
    }

    // Aggregate by type
    const typeMap = new Map<string, { typeName: string; amount: number; target: number | null }>();
    let totalAmount = 0;

    for (const income of incomes || []) {
      const incomeType = income.income_type as {
        id: string;
        name: string;
        target_amount: number | null;
      } | null;
      if (!incomeType) continue;

      const typeId = incomeType.id;
      const existing = typeMap.get(typeId);

      if (existing) {
        existing.amount += Number(income.amount);
      } else {
        typeMap.set(typeId, {
          typeName: incomeType.name,
          amount: Number(income.amount),
          target: incomeType.target_amount,
        });
      }

      totalAmount += Number(income.amount);
    }

    return {
      totalAmount,
      byType: Array.from(typeMap.entries()).map(([typeId, data]) => ({
        typeId,
        ...data,
      })),
    };
  }

  /**
   * Get target progress for all income types
   */
  async getTargetProgress(
    userId: string,
    year: number,
    month: number,
    accessToken: string
  ): Promise<
    {
      typeId: string;
      typeName: string;
      target: number;
      actual: number;
      percentage: number;
      remaining: number;
    }[]
  > {
    const supabase = getSupabaseClientWithAuth(accessToken);

    // Get all income types with targets
    const { data: incomeTypes, error: typesError } = await supabase
      .from('income_types')
      .select('*')
      .eq('user_id', userId)
      .not('target_amount', 'is', null);

    if (typesError) {
      throw parseSupabaseError(typesError);
    }

    // Get monthly summary
    const summary = await this.getMonthlySummary(userId, year, month, accessToken);

    // Create a map of actual amounts by type
    const actualMap = new Map<string, number>();
    for (const item of summary.byType) {
      actualMap.set(item.typeId, item.amount);
    }

    // Calculate progress for each type with a target
    return ((incomeTypes as IncomeType[]) || []).map((type) => {
      const target = Number(type.target_amount);
      const actual = actualMap.get(type.id) || 0;
      const percentage = target > 0 ? Math.min((actual / target) * 100, 100) : 0;
      const remaining = Math.max(target - actual, 0);

      return {
        typeId: type.id,
        typeName: type.name,
        target,
        actual,
        percentage: Math.round(percentage * 100) / 100,
        remaining,
      };
    });
  }
}

export const incomeTypeRepository = new IncomeTypeRepository();
export const incomeRepository = new IncomeRepository();
