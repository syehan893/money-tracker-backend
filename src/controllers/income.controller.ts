/**
 * Income and Income Type Controllers
 * Handles HTTP requests for income management endpoints
 */

import type { Response, NextFunction } from 'express';
import { incomeTypeService, incomeService } from '../services/income.service';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/response.util';
import type {
  AuthenticatedRequest,
  CreateIncomeTypeDto,
  UpdateIncomeTypeDto,
  CreateIncomeDto,
  UpdateIncomeDto,
} from '../types/api.types';

// ============================================
// INCOME TYPE CONTROLLER
// ============================================

export class IncomeTypeController {
  /**
   * GET /api/v1/income-types
   * Get all income types
   */
  async getIncomeTypes(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { user, accessToken } = req;

      const incomeTypes = await incomeTypeService.getIncomeTypes(user.id, accessToken);

      sendSuccess(res, incomeTypes);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/income-types/:id
   * Get income type by ID
   */
  async getIncomeTypeById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { user, accessToken } = req;
      const { id } = req.params;

      const incomeType = await incomeTypeService.getIncomeTypeById(user.id, id, accessToken);

      sendSuccess(res, incomeType);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/income-types
   * Create income type
   */
  async createIncomeType(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { user, accessToken } = req;
      const { name, description, targetAmount } = req.body as CreateIncomeTypeDto;

      const incomeType = await incomeTypeService.createIncomeType(
        user.id,
        { name, description, targetAmount },
        accessToken
      );

      sendCreated(res, incomeType, 'Income type created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/income-types/:id
   * Update income type
   */
  async updateIncomeType(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { user, accessToken } = req;
      const { id } = req.params;
      const { name, description, targetAmount, isActive } = req.body as UpdateIncomeTypeDto;

      const incomeType = await incomeTypeService.updateIncomeType(
        user.id,
        id,
        { name, description, targetAmount, isActive },
        accessToken
      );

      sendSuccess(res, incomeType, 'Income type updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/income-types/:id
   * Delete income type
   */
  async deleteIncomeType(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { user, accessToken } = req;
      const { id } = req.params;

      await incomeTypeService.deleteIncomeType(user.id, id, accessToken);

      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  }
}

// ============================================
// INCOME CONTROLLER
// ============================================

export class IncomeController {
  /**
   * GET /api/v1/incomes
   * Get all incomes with filters and pagination
   */
  async getIncomes(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { user, accessToken } = req;
      const { accountId, incomeTypeId, startDate, endDate, page, limit } = req.query as {
        accountId?: string;
        incomeTypeId?: string;
        startDate?: string;
        endDate?: string;
        page?: string;
        limit?: string;
      };

      const result = await incomeService.getIncomes(user.id, accessToken, {
        accountId,
        incomeTypeId,
        startDate,
        endDate,
        page: page ? parseInt(page, 10) : undefined,
        limit: limit ? parseInt(limit, 10) : undefined,
      });

      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/incomes/:id
   * Get income by ID
   */
  async getIncomeById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { user, accessToken } = req;
      const { id } = req.params;

      const income = await incomeService.getIncomeById(user.id, id, accessToken);

      sendSuccess(res, income);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/incomes
   * Create income
   */
  async createIncome(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { user, accessToken } = req;
      const { accountId, incomeTypeId, amount, description, date } = req.body as CreateIncomeDto;

      const income = await incomeService.createIncome(
        user.id,
        { accountId, incomeTypeId, amount, description, date },
        accessToken
      );

      sendCreated(res, income, 'Income recorded successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/incomes/:id
   * Update income
   */
  async updateIncome(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { user, accessToken } = req;
      const { id } = req.params;
      const { accountId, incomeTypeId, amount, description, date } = req.body as UpdateIncomeDto;

      const income = await incomeService.updateIncome(
        user.id,
        id,
        { accountId, incomeTypeId, amount, description, date },
        accessToken
      );

      sendSuccess(res, income, 'Income updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/incomes/:id
   * Delete income
   */
  async deleteIncome(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { user, accessToken } = req;
      const { id } = req.params;

      await incomeService.deleteIncome(user.id, id, accessToken);

      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/incomes/monthly/:year/:month
   * Get monthly income summary
   */
  async getMonthlySummary(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { user, accessToken } = req;
      const { year, month } = req.params;

      const summary = await incomeService.getMonthlySummary(
        user.id,
        parseInt(year, 10),
        parseInt(month, 10),
        accessToken
      );

      sendSuccess(res, summary);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/incomes/target-progress
   * Get target vs actual progress
   */
  async getTargetProgress(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { user, accessToken } = req;

      const progress = await incomeService.getTargetProgress(user.id, accessToken);

      sendSuccess(res, progress);
    } catch (error) {
      next(error);
    }
  }
}

export const incomeTypeController = new IncomeTypeController();
export const incomeController = new IncomeController();
