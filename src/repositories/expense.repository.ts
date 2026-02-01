/**
 * Expense and Expense Type Repositories
 * Handles database operations for expenses and expense types
 */

import { getSupabaseClientWithAuth } from '../config/database';
import type {
  ExpenseType,
  ExpenseTypeInsert,
  ExpenseTypeUpdate,
  ExpenseInsert,
  ExpenseUpdate,
  ExpenseWithRelations,
} from '../types/database.types';
import { parseSupabaseError, NotFoundError } from '../middleware/error.middleware';

// ============================================
// EXPENSE TYPE REPOSITORY
// ============================================

export class ExpenseTypeRepository {
  /**
   * Get all expense types for a user
   */
  async findAll(userId: string, accessToken: string): Promise<ExpenseType[]> {
    const supabase = getSupabaseClientWithAuth(accessToken);

    const { data, error } = await supabase
      .from('expense_types')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true });

    if (error) {
      throw parseSupabaseError(error);
    }

    return data || [];
  }

  /**
   * Get expense type by ID
   */
  async findById(
    userId: string,
    expenseTypeId: string,
    accessToken: string
  ): Promise<ExpenseType | null> {
    const supabase = getSupabaseClientWithAuth(accessToken);

    const { data, error } = await supabase
      .from('expense_types')
      .select('*')
      .eq('id', expenseTypeId)
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
   * Create a new expense type
   */
  async create(
    userId: string,
    data: Omit<ExpenseTypeInsert, 'id' | 'user_id'>,
    accessToken: string
  ): Promise<ExpenseType> {
    const supabase = getSupabaseClientWithAuth(accessToken);

    const { data: expenseType, error } = await supabase
      .from('expense_types')
      .insert({
        ...data,
        user_id: userId,
      })
      .select()
      .single();

    if (error) {
      throw parseSupabaseError(error);
    }

    if (!expenseType) {
      throw new Error('Failed to create expense type');
    }

    return expenseType;
  }

  /**
   * Update an expense type
   */
  async update(
    userId: string,
    expenseTypeId: string,
    data: ExpenseTypeUpdate,
    accessToken: string
  ): Promise<ExpenseType> {
    const supabase = getSupabaseClientWithAuth(accessToken);

    const { data: expenseType, error } = await supabase
      .from('expense_types')
      .update(data)
      .eq('id', expenseTypeId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundError('Expense type', expenseTypeId);
      }
      throw parseSupabaseError(error);
    }

    if (!expenseType) {
      throw new NotFoundError('Expense type', expenseTypeId);
    }

    return expenseType;
  }

  /**
   * Delete an expense type
   */
  async delete(userId: string, expenseTypeId: string, accessToken: string): Promise<void> {
    const supabase = getSupabaseClientWithAuth(accessToken);

    const { error } = await supabase
      .from('expense_types')
      .delete()
      .eq('id', expenseTypeId)
      .eq('user_id', userId);

    if (error) {
      throw parseSupabaseError(error);
    }
  }
}

// ============================================
// EXPENSE REPOSITORY
// ============================================

export interface ExpenseFilters {
  accountId?: string;
  expenseTypeId?: string;
  startDate?: string;
  endDate?: string;
}

export class ExpenseRepository {
  /**
   * Get all expenses for a user with optional filters
   */
  async findAll(
    userId: string,
    accessToken: string,
    filters?: ExpenseFilters,
    offset?: number,
    limit?: number
  ): Promise<{ expenses: ExpenseWithRelations[]; total: number }> {
    const supabase = getSupabaseClientWithAuth(accessToken);

    let query = supabase
      .from('expenses')
      .select(
        `
        *,
        account:accounts(id, name, account_type),
        expense_type:expense_types(id, name, budget_amount)
      `,
        { count: 'exact' }
      )
      .eq('user_id', userId);

    if (filters?.accountId) {
      query = query.eq('account_id', filters.accountId);
    }

    if (filters?.expenseTypeId) {
      query = query.eq('expense_type_id', filters.expenseTypeId);
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
      expenses: (data || []) as ExpenseWithRelations[],
      total: count || 0,
    };
  }

  /**
   * Get expense by ID
   */
  async findById(
    userId: string,
    expenseId: string,
    accessToken: string
  ): Promise<ExpenseWithRelations | null> {
    const supabase = getSupabaseClientWithAuth(accessToken);

    const { data, error } = await supabase
      .from('expenses')
      .select(
        `
        *,
        account:accounts(id, name, account_type),
        expense_type:expense_types(id, name, budget_amount)
      `
      )
      .eq('id', expenseId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw parseSupabaseError(error);
    }

    return data as ExpenseWithRelations;
  }

  /**
   * Create a new expense
   */
  async create(
    userId: string,
    data: Omit<ExpenseInsert, 'id' | 'user_id'>,
    accessToken: string
  ): Promise<ExpenseWithRelations> {
    const supabase = getSupabaseClientWithAuth(accessToken);

    const { data: expense, error } = await supabase
      .from('expenses')
      .insert({
        ...data,
        user_id: userId,
      })
      .select(
        `
        *,
        account:accounts(id, name, account_type),
        expense_type:expense_types(id, name, budget_amount)
      `
      )
      .single();

    if (error) {
      throw parseSupabaseError(error);
    }

    if (!expense) {
      throw new Error('Failed to create expense');
    }

    return expense as ExpenseWithRelations;
  }

  /**
   * Update an expense
   */
  async update(
    userId: string,
    expenseId: string,
    data: ExpenseUpdate,
    accessToken: string
  ): Promise<ExpenseWithRelations> {
    const supabase = getSupabaseClientWithAuth(accessToken);

    const { data: expense, error } = await supabase
      .from('expenses')
      .update(data)
      .eq('id', expenseId)
      .eq('user_id', userId)
      .select(
        `
        *,
        account:accounts(id, name, account_type),
        expense_type:expense_types(id, name, budget_amount)
      `
      )
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundError('Expense', expenseId);
      }
      throw parseSupabaseError(error);
    }

    if (!expense) {
      throw new NotFoundError('Expense', expenseId);
    }

    return expense as ExpenseWithRelations;
  }

  /**
   * Delete an expense
   */
  async delete(userId: string, expenseId: string, accessToken: string): Promise<void> {
    const supabase = getSupabaseClientWithAuth(accessToken);

    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expenseId)
      .eq('user_id', userId);

    if (error) {
      throw parseSupabaseError(error);
    }
  }

  /**
   * Get monthly expense summary
   */
  async getMonthlySummary(
    userId: string,
    year: number,
    month: number,
    accessToken: string
  ): Promise<{
    totalAmount: number;
    byType: { typeId: string; typeName: string; amount: number; budget: number | null }[];
  }> {
    const supabase = getSupabaseClientWithAuth(accessToken);

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    const { data: expenses, error } = await supabase
      .from('expenses')
      .select(
        `
        amount,
        expense_type:expense_types(id, name, budget_amount)
      `
      )
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate);

    if (error) {
      throw parseSupabaseError(error);
    }

    const typeMap = new Map<string, { typeName: string; amount: number; budget: number | null }>();
    let totalAmount = 0;

    for (const expense of expenses || []) {
      const expenseType = expense.expense_type as {
        id: string;
        name: string;
        budget_amount: number | null;
      } | null;
      if (!expenseType) continue;

      const typeId = expenseType.id;
      const existing = typeMap.get(typeId);

      if (existing) {
        existing.amount += Number(expense.amount);
      } else {
        typeMap.set(typeId, {
          typeName: expenseType.name,
          amount: Number(expense.amount),
          budget: expenseType.budget_amount,
        });
      }

      totalAmount += Number(expense.amount);
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
   * Get budget status for current month
   */
  async getBudgetStatus(
    userId: string,
    year: number,
    month: number,
    accessToken: string
  ): Promise<
    {
      typeId: string;
      typeName: string;
      budget: number;
      spent: number;
      remaining: number;
      percentage: number;
      isOverBudget: boolean;
    }[]
  > {
    const supabase = getSupabaseClientWithAuth(accessToken);

    // Get all expense types with budgets
    const { data: expenseTypes, error: typesError } = await supabase
      .from('expense_types')
      .select('*')
      .eq('user_id', userId)
      .not('budget_amount', 'is', null);

    if (typesError) {
      throw parseSupabaseError(typesError);
    }

    // Get monthly summary
    const summary = await this.getMonthlySummary(userId, year, month, accessToken);

    // Create a map of spent amounts by type
    const spentMap = new Map<string, number>();
    for (const item of summary.byType) {
      spentMap.set(item.typeId, item.amount);
    }

    // Calculate budget status for each type with a budget
    return ((expenseTypes as ExpenseType[]) || []).map((type) => {
      const budget = Number(type.budget_amount);
      const spent = spentMap.get(type.id) || 0;
      const remaining = Math.max(budget - spent, 0);
      const percentage = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
      const isOverBudget = spent > budget;

      return {
        typeId: type.id,
        typeName: type.name,
        budget,
        spent,
        remaining,
        percentage: Math.round(percentage * 100) / 100,
        isOverBudget,
      };
    });
  }
}

export const expenseTypeRepository = new ExpenseTypeRepository();
export const expenseRepository = new ExpenseRepository();
