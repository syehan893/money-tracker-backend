/**
 * Income and Income Type Services
 * Handles business logic for income management
 */

import {
  incomeTypeRepository,
  incomeRepository,
  type IncomeFilters,
} from '../repositories/income.repository';
import { accountService } from './account.service';
import { NotFoundError, ValidationError } from '../middleware/error.middleware';
import type {
  CreateIncomeTypeDto,
  UpdateIncomeTypeDto,
  CreateIncomeDto,
  UpdateIncomeDto,
  MonthlySummary,
  TargetProgress,
  PaginatedResponse,
} from '../types/api.types';
import type { IncomeType, IncomeWithRelations } from '../types/database.types';
import { parsePaginationParams } from '../utils/validation.util';

// ============================================
// INCOME TYPE SERVICE
// ============================================

export class IncomeTypeService {
  /**
   * Get all income types for a user
   */
  async getIncomeTypes(userId: string, accessToken: string): Promise<IncomeType[]> {
    return incomeTypeRepository.findAll(userId, accessToken);
  }

  /**
   * Get income type by ID
   */
  async getIncomeTypeById(
    userId: string,
    incomeTypeId: string,
    accessToken: string
  ): Promise<IncomeType> {
    const incomeType = await incomeTypeRepository.findById(userId, incomeTypeId, accessToken);

    if (!incomeType) {
      throw new NotFoundError('Income type', incomeTypeId);
    }

    return incomeType;
  }

  /**
   * Create a new income type
   */
  async createIncomeType(
    userId: string,
    data: CreateIncomeTypeDto,
    accessToken: string
  ): Promise<IncomeType> {
    const { name, description, targetAmount } = data;

    return incomeTypeRepository.create(
      userId,
      {
        name,
        description: description || null,
        target_amount: targetAmount || null,
      },
      accessToken
    );
  }

  /**
   * Update an income type
   */
  async updateIncomeType(
    userId: string,
    incomeTypeId: string,
    data: UpdateIncomeTypeDto,
    accessToken: string
  ): Promise<IncomeType> {
    // Check if income type exists
    const existing = await incomeTypeRepository.findById(userId, incomeTypeId, accessToken);
    if (!existing) {
      throw new NotFoundError('Income type', incomeTypeId);
    }

    const updateData: {
      name?: string;
      description?: string | null;
      target_amount?: number | null;
      is_active?: boolean;
    } = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
    }

    if (data.description !== undefined) {
      updateData.description = data.description;
    }

    if (data.targetAmount !== undefined) {
      updateData.target_amount = data.targetAmount;
    }

    if (data.isActive !== undefined) {
      updateData.is_active = data.isActive;
    }

    return incomeTypeRepository.update(userId, incomeTypeId, updateData, accessToken);
  }

  /**
   * Delete an income type
   */
  async deleteIncomeType(
    userId: string,
    incomeTypeId: string,
    accessToken: string
  ): Promise<void> {
    // Check if income type exists
    const existing = await incomeTypeRepository.findById(userId, incomeTypeId, accessToken);
    if (!existing) {
      throw new NotFoundError('Income type', incomeTypeId);
    }

    await incomeTypeRepository.delete(userId, incomeTypeId, accessToken);
  }
}

// ============================================
// INCOME SERVICE
// ============================================

export class IncomeService {
  /**
   * Get all incomes with filters and pagination
   */
  async getIncomes(
    userId: string,
    accessToken: string,
    filters?: IncomeFilters & { page?: number; limit?: number }
  ): Promise<PaginatedResponse<IncomeWithRelations>> {
    const { page, limit, offset } = parsePaginationParams(
      filters?.page,
      filters?.limit
    );

    const { incomes, total } = await incomeRepository.findAll(
      userId,
      accessToken,
      {
        accountId: filters?.accountId,
        incomeTypeId: filters?.incomeTypeId,
        startDate: filters?.startDate,
        endDate: filters?.endDate,
      },
      offset,
      limit
    );

    return {
      items: incomes,
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
   * Get income by ID
   */
  async getIncomeById(
    userId: string,
    incomeId: string,
    accessToken: string
  ): Promise<IncomeWithRelations> {
    const income = await incomeRepository.findById(userId, incomeId, accessToken);

    if (!income) {
      throw new NotFoundError('Income', incomeId);
    }

    return income;
  }

  /**
   * Create a new income
   */
  async createIncome(
    userId: string,
    data: CreateIncomeDto,
    accessToken: string
  ): Promise<IncomeWithRelations> {
    const { accountId, incomeTypeId, amount, description, date } = data;

    // Validate account exists and belongs to user
    await accountService.validateAccountOwnership(userId, accountId, accessToken);

    // Validate income type exists
    const incomeType = await incomeTypeRepository.findById(userId, incomeTypeId, accessToken);
    if (!incomeType) {
      throw new ValidationError('Income type not found');
    }

    // Amount validation
    if (amount <= 0) {
      throw new ValidationError('Amount must be a positive number');
    }

    return incomeRepository.create(
      userId,
      {
        account_id: accountId,
        income_type_id: incomeTypeId,
        amount,
        description: description || null,
        date,
      },
      accessToken
    );
  }

  /**
   * Update an income
   */
  async updateIncome(
    userId: string,
    incomeId: string,
    data: UpdateIncomeDto,
    accessToken: string
  ): Promise<IncomeWithRelations> {
    // Check if income exists
    const existing = await incomeRepository.findById(userId, incomeId, accessToken);
    if (!existing) {
      throw new NotFoundError('Income', incomeId);
    }

    // Validate account if changing
    if (data.accountId && data.accountId !== existing.account_id) {
      await accountService.validateAccountOwnership(userId, data.accountId, accessToken);
    }

    // Validate income type if changing
    if (data.incomeTypeId && data.incomeTypeId !== existing.income_type_id) {
      const incomeType = await incomeTypeRepository.findById(
        userId,
        data.incomeTypeId,
        accessToken
      );
      if (!incomeType) {
        throw new ValidationError('Income type not found');
      }
    }

    // Amount validation
    if (data.amount !== undefined && data.amount <= 0) {
      throw new ValidationError('Amount must be a positive number');
    }

    const updateData: {
      account_id?: string;
      income_type_id?: string;
      amount?: number;
      description?: string | null;
      date?: string;
    } = {};

    if (data.accountId !== undefined) {
      updateData.account_id = data.accountId;
    }

    if (data.incomeTypeId !== undefined) {
      updateData.income_type_id = data.incomeTypeId;
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

    return incomeRepository.update(userId, incomeId, updateData, accessToken);
  }

  /**
   * Delete an income
   */
  async deleteIncome(userId: string, incomeId: string, accessToken: string): Promise<void> {
    // Check if income exists
    const existing = await incomeRepository.findById(userId, incomeId, accessToken);
    if (!existing) {
      throw new NotFoundError('Income', incomeId);
    }

    await incomeRepository.delete(userId, incomeId, accessToken);
  }

  /**
   * Get monthly income summary
   */
  async getMonthlySummary(
    userId: string,
    year: number,
    month: number,
    accessToken: string
  ): Promise<MonthlySummary> {
    const summary = await incomeRepository.getMonthlySummary(userId, year, month, accessToken);

    return {
      year,
      month,
      totalAmount: summary.totalAmount,
      byType: summary.byType.map((item) => ({
        typeId: item.typeId,
        typeName: item.typeName,
        amount: item.amount,
        target: item.target || undefined,
        percentage:
          item.target && item.target > 0
            ? Math.round((item.amount / item.target) * 10000) / 100
            : undefined,
      })),
    };
  }

  /**
   * Get target progress for current month
   */
  async getTargetProgress(userId: string, accessToken: string): Promise<TargetProgress[]> {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    return incomeRepository.getTargetProgress(userId, year, month, accessToken);
  }
}

export const incomeTypeService = new IncomeTypeService();
export const incomeService = new IncomeService();
