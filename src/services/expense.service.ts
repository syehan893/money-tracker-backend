/**
 * Expense and Expense Type Services
 * Handles business logic for expense management
 */

import {
  expenseTypeRepository,
  expenseRepository,
  type ExpenseFilters,
} from '../repositories/expense.repository';
import { accountService } from './account.service';
import {
  NotFoundError,
  ValidationError,
  InsufficientBalanceError,
} from '../middleware/error.middleware';
import type {
  CreateExpenseTypeDto,
  UpdateExpenseTypeDto,
  CreateExpenseDto,
  UpdateExpenseDto,
  MonthlySummary,
  BudgetStatus,
  PaginatedResponse,
} from '../types/api.types';
import type { ExpenseType, ExpenseWithRelations } from '../types/database.types';
import { parsePaginationParams } from '../utils/validation.util';

// ============================================
// EXPENSE TYPE SERVICE
// ============================================

export class ExpenseTypeService {
  /**
   * Get all expense types for a user
   */
  async getExpenseTypes(userId: string, accessToken: string): Promise<ExpenseType[]> {
    return expenseTypeRepository.findAll(userId, accessToken);
  }

  /**
   * Get expense type by ID
   */
  async getExpenseTypeById(
    userId: string,
    expenseTypeId: string,
    accessToken: string
  ): Promise<ExpenseType> {
    const expenseType = await expenseTypeRepository.findById(userId, expenseTypeId, accessToken);

    if (!expenseType) {
      throw new NotFoundError('Expense type', expenseTypeId);
    }

    return expenseType;
  }

  /**
   * Create a new expense type
   */
  async createExpenseType(
    userId: string,
    data: CreateExpenseTypeDto,
    accessToken: string
  ): Promise<ExpenseType> {
    const { name, description, budgetAmount } = data;

    return expenseTypeRepository.create(
      userId,
      {
        name,
        description: description || null,
        budget_amount: budgetAmount || null,
      },
      accessToken
    );
  }

  /**
   * Update an expense type
   */
  async updateExpenseType(
    userId: string,
    expenseTypeId: string,
    data: UpdateExpenseTypeDto,
    accessToken: string
  ): Promise<ExpenseType> {
    // Check if expense type exists
    const existing = await expenseTypeRepository.findById(userId, expenseTypeId, accessToken);
    if (!existing) {
      throw new NotFoundError('Expense type', expenseTypeId);
    }

    const updateData: {
      name?: string;
      description?: string | null;
      budget_amount?: number | null;
      is_active?: boolean;
    } = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
    }

    if (data.description !== undefined) {
      updateData.description = data.description;
    }

    if (data.budgetAmount !== undefined) {
      updateData.budget_amount = data.budgetAmount;
    }

    if (data.isActive !== undefined) {
      updateData.is_active = data.isActive;
    }

    return expenseTypeRepository.update(userId, expenseTypeId, updateData, accessToken);
  }

  /**
   * Delete an expense type
   */
  async deleteExpenseType(
    userId: string,
    expenseTypeId: string,
    accessToken: string
  ): Promise<void> {
    // Check if expense type exists
    const existing = await expenseTypeRepository.findById(userId, expenseTypeId, accessToken);
    if (!existing) {
      throw new NotFoundError('Expense type', expenseTypeId);
    }

    await expenseTypeRepository.delete(userId, expenseTypeId, accessToken);
  }
}

// ============================================
// EXPENSE SERVICE
// ============================================

export class ExpenseService {
  /**
   * Get all expenses with filters and pagination
   */
  async getExpenses(
    userId: string,
    accessToken: string,
    filters?: ExpenseFilters & { page?: number; limit?: number }
  ): Promise<PaginatedResponse<ExpenseWithRelations>> {
    const { page, limit, offset } = parsePaginationParams(filters?.page, filters?.limit);

    const { expenses, total } = await expenseRepository.findAll(
      userId,
      accessToken,
      {
        accountId: filters?.accountId,
        expenseTypeId: filters?.expenseTypeId,
        startDate: filters?.startDate,
        endDate: filters?.endDate,
      },
      offset,
      limit
    );

    return {
      items: expenses,
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
   * Get expense by ID
   */
  async getExpenseById(
    userId: string,
    expenseId: string,
    accessToken: string
  ): Promise<ExpenseWithRelations> {
    const expense = await expenseRepository.findById(userId, expenseId, accessToken);

    if (!expense) {
      throw new NotFoundError('Expense', expenseId);
    }

    return expense;
  }

  /**
   * Create a new expense
   */
  async createExpense(
    userId: string,
    data: CreateExpenseDto,
    accessToken: string
  ): Promise<ExpenseWithRelations> {
    const { accountId, expenseTypeId, amount, description, date } = data;

    // Validate account exists and belongs to user
    const account = await accountService.validateAccountOwnership(userId, accountId, accessToken);

    // Check sufficient balance
    if (Number(account.balance) < amount) {
      throw new InsufficientBalanceError(accountId, amount, Number(account.balance));
    }

    // Validate expense type exists
    const expenseType = await expenseTypeRepository.findById(userId, expenseTypeId, accessToken);
    if (!expenseType) {
      throw new ValidationError('Expense type not found');
    }

    // Amount validation
    if (amount <= 0) {
      throw new ValidationError('Amount must be a positive number');
    }

    return expenseRepository.create(
      userId,
      {
        account_id: accountId,
        expense_type_id: expenseTypeId,
        amount,
        description: description || null,
        date,
      },
      accessToken
    );
  }

  /**
   * Update an expense
   */
  async updateExpense(
    userId: string,
    expenseId: string,
    data: UpdateExpenseDto,
    accessToken: string
  ): Promise<ExpenseWithRelations> {
    // Check if expense exists
    const existing = await expenseRepository.findById(userId, expenseId, accessToken);
    if (!existing) {
      throw new NotFoundError('Expense', expenseId);
    }

    // Validate account if changing
    if (data.accountId && data.accountId !== existing.account_id) {
      const account = await accountService.validateAccountOwnership(
        userId,
        data.accountId,
        accessToken
      );

      // If changing account, check balance of new account
      const newAmount = data.amount ?? existing.amount;
      if (Number(account.balance) < newAmount) {
        throw new InsufficientBalanceError(data.accountId, newAmount, Number(account.balance));
      }
    } else if (data.amount && data.amount > existing.amount) {
      // If increasing amount on same account, check balance
      const account = await accountService.getAccountById(userId, existing.account_id, accessToken);
      // Current balance + existing expense amount is the available balance
      const availableBalance = Number(account.balance) + existing.amount;
      if (availableBalance < data.amount) {
        throw new InsufficientBalanceError(existing.account_id, data.amount, availableBalance);
      }
    }

    // Validate expense type if changing
    if (data.expenseTypeId && data.expenseTypeId !== existing.expense_type_id) {
      const expenseType = await expenseTypeRepository.findById(
        userId,
        data.expenseTypeId,
        accessToken
      );
      if (!expenseType) {
        throw new ValidationError('Expense type not found');
      }
    }

    // Amount validation
    if (data.amount !== undefined && data.amount <= 0) {
      throw new ValidationError('Amount must be a positive number');
    }

    const updateData: {
      account_id?: string;
      expense_type_id?: string;
      amount?: number;
      description?: string | null;
      date?: string;
    } = {};

    if (data.accountId !== undefined) {
      updateData.account_id = data.accountId;
    }

    if (data.expenseTypeId !== undefined) {
      updateData.expense_type_id = data.expenseTypeId;
    }

    if (data.amount !== undefined) {
      updateData.amount = data.amount;
    }

    if (data.description !== undefined) {
      updateData.description = data.description;
    }

    if (data.date !== undefined) {
      updateData.date = data.date;
    }

    return expenseRepository.update(userId, expenseId, updateData, accessToken);
  }

  /**
   * Delete an expense
   */
  async deleteExpense(userId: string, expenseId: string, accessToken: string): Promise<void> {
    // Check if expense exists
    const existing = await expenseRepository.findById(userId, expenseId, accessToken);
    if (!existing) {
      throw new NotFoundError('Expense', expenseId);
    }

    await expenseRepository.delete(userId, expenseId, accessToken);
  }

  /**
   * Get monthly expense summary
   */
  async getMonthlySummary(
    userId: string,
    year: number,
    month: number,
    accessToken: string
  ): Promise<MonthlySummary> {
    const summary = await expenseRepository.getMonthlySummary(userId, year, month, accessToken);

    return {
      year,
      month,
      totalAmount: summary.totalAmount,
      byType: summary.byType.map((item) => ({
        typeId: item.typeId,
        typeName: item.typeName,
        amount: item.amount,
        target: item.budget || undefined,
        percentage:
          item.budget && item.budget > 0
            ? Math.round((item.amount / item.budget) * 10000) / 100
            : undefined,
      })),
    };
  }

  /**
   * Get budget status for current month
   */
  async getBudgetStatus(userId: string, accessToken: string): Promise<BudgetStatus[]> {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    return expenseRepository.getBudgetStatus(userId, year, month, accessToken);
  }
}

export const expenseTypeService = new ExpenseTypeService();
export const expenseService = new ExpenseService();
