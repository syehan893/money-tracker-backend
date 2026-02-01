/**
 * Expense and Expense Type Controllers
 * Handles HTTP requests for expense management endpoints
 */

import type { Response, NextFunction } from 'express';
import { expenseTypeService, expenseService } from '../services/expense.service';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/response.util';
import type {
  AuthenticatedRequest,
  CreateExpenseTypeDto,
  UpdateExpenseTypeDto,
  CreateExpenseDto,
  UpdateExpenseDto,
} from '../types/api.types';

// ============================================
// EXPENSE TYPE CONTROLLER
// ============================================

export class ExpenseTypeController {
  /**
   * GET /api/v1/expense-types
   * Get all expense types
   */
  async getExpenseTypes(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { user, accessToken } = req;

      const expenseTypes = await expenseTypeService.getExpenseTypes(user.id, accessToken);

      sendSuccess(res, expenseTypes);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/expense-types/:id
   * Get expense type by ID
   */
  async getExpenseTypeById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { user, accessToken } = req;
      const { id } = req.params;

      const expenseType = await expenseTypeService.getExpenseTypeById(user.id, id, accessToken);

      sendSuccess(res, expenseType);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/expense-types
   * Create expense type
   */
  async createExpenseType(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { user, accessToken } = req;
      const { name, description, budgetAmount } = req.body as CreateExpenseTypeDto;

      const expenseType = await expenseTypeService.createExpenseType(
        user.id,
        { name, description, budgetAmount },
        accessToken
      );

      sendCreated(res, expenseType, 'Expense type created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/expense-types/:id
   * Update expense type
   */
  async updateExpenseType(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { user, accessToken } = req;
      const { id } = req.params;
      const { name, description, budgetAmount, isActive } = req.body as UpdateExpenseTypeDto;

      const expenseType = await expenseTypeService.updateExpenseType(
        user.id,
        id,
        { name, description, budgetAmount, isActive },
        accessToken
      );

      sendSuccess(res, expenseType, 'Expense type updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/expense-types/:id
   * Delete expense type
   */
  async deleteExpenseType(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { user, accessToken } = req;
      const { id } = req.params;

      await expenseTypeService.deleteExpenseType(user.id, id, accessToken);

      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  }
}

// ============================================
// EXPENSE CONTROLLER
// ============================================

export class ExpenseController {
  /**
   * GET /api/v1/expenses
   * Get all expenses with filters and pagination
   */
  async getExpenses(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { user, accessToken } = req;
      const { accountId, expenseTypeId, startDate, endDate, page, limit } = req.query as {
        accountId?: string;
        expenseTypeId?: string;
        startDate?: string;
        endDate?: string;
        page?: string;
        limit?: string;
      };

      const result = await expenseService.getExpenses(user.id, accessToken, {
        accountId,
        expenseTypeId,
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
   * GET /api/v1/expenses/:id
   * Get expense by ID
   */
  async getExpenseById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { user, accessToken } = req;
      const { id } = req.params;

      const expense = await expenseService.getExpenseById(user.id, id, accessToken);

      sendSuccess(res, expense);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/expenses
   * Create expense
   */
  async createExpense(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { user, accessToken } = req;
      const { accountId, expenseTypeId, amount, description, date } = req.body as CreateExpenseDto;

      const expense = await expenseService.createExpense(
        user.id,
        { accountId, expenseTypeId, amount, description, date },
        accessToken
      );

      sendCreated(res, expense, 'Expense recorded successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/expenses/:id
   * Update expense
   */
  async updateExpense(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { user, accessToken } = req;
      const { id } = req.params;
      const { accountId, expenseTypeId, amount, description, date } = req.body as UpdateExpenseDto;

      const expense = await expenseService.updateExpense(
        user.id,
        id,
        { accountId, expenseTypeId, amount, description, date },
        accessToken
      );

      sendSuccess(res, expense, 'Expense updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/expenses/:id
   * Delete expense
   */
  async deleteExpense(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { user, accessToken } = req;
      const { id } = req.params;

      await expenseService.deleteExpense(user.id, id, accessToken);

      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/expenses/monthly/:year/:month
   * Get monthly expense summary
   */
  async getMonthlySummary(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { user, accessToken } = req;
      const { year, month } = req.params;

      const summary = await expenseService.getMonthlySummary(
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
   * GET /api/v1/expenses/budget-status
   * Get budget vs actual for current month
   */
  async getBudgetStatus(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { user, accessToken } = req;

      const status = await expenseService.getBudgetStatus(user.id, accessToken);

      sendSuccess(res, status);
    } catch (error) {
      next(error);
    }
  }
}

export const expenseTypeController = new ExpenseTypeController();
export const expenseController = new ExpenseController();
