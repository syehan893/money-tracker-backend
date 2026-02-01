/* eslint-disable @typescript-eslint/no-misused-promises */
/**
 * Expense and Expense Type Routes
 */

import { Router } from 'express';
import { expenseTypeController, expenseController } from '../controllers/expense.controller';
import { authenticateUser } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import {
  createExpenseTypeValidator,
  updateExpenseTypeValidator,
  expenseTypeIdValidator,
  createExpenseValidator,
  updateExpenseValidator,
  expenseIdValidator,
  expenseFiltersValidator,
  expenseMonthlySummaryValidator,
} from '../validators/expense.validator';
import type { AuthenticatedRequest } from '../types/api.types';

// ============================================
// EXPENSE TYPE ROUTES
// ============================================

const expenseTypeRouter = Router();

// All expense type routes require authentication
expenseTypeRouter.use(authenticateUser);

/**
 * GET /api/v1/expense-types
 * Get all expense types
 */
expenseTypeRouter.get(
  '/',
  asyncHandler(expenseTypeController.getExpenseTypes.bind(expenseTypeController))
);

/**
 * GET /api/v1/expense-types/:id
 * Get expense type by ID
 */
expenseTypeRouter.get(
  '/:id',
  validate(expenseTypeIdValidator),
  asyncHandler(expenseTypeController.getExpenseTypeById.bind(expenseTypeController))
);

/**
 * POST /api/v1/expense-types
 * Create expense type
 */
expenseTypeRouter.post(
  '/',
  validate(createExpenseTypeValidator),
  asyncHandler(expenseTypeController.createExpenseType.bind(expenseTypeController))
);

/**
 * PUT /api/v1/expense-types/:id
 * Update expense type
 */
expenseTypeRouter.put(
  '/:id',
  validate(updateExpenseTypeValidator),
  asyncHandler(expenseTypeController.updateExpenseType.bind(expenseTypeController))
);

/**
 * DELETE /api/v1/expense-types/:id
 * Delete expense type
 */
expenseTypeRouter.delete(
  '/:id',
  validate(expenseTypeIdValidator),
  asyncHandler(expenseTypeController.deleteExpenseType.bind(expenseTypeController))
);

// ============================================
// EXPENSE ROUTES
// ============================================

const expenseRouter = Router();

// All expense routes require authentication
expenseRouter.use(authenticateUser);

/**
 * GET /api/v1/expenses/budget-status
 * Get budget vs actual for current month
 * Note: Must come before /:id
 */
expenseRouter.get(
  '/budget-status',
  asyncHandler(expenseController.getBudgetStatus.bind(expenseController))
);

/**
 * GET /api/v1/expenses/monthly/:year/:month
 * Get monthly expense summary
 * Note: Must come before /:id
 */
expenseRouter.get(
  '/monthly/:year/:month',
  validate(expenseMonthlySummaryValidator),
  asyncHandler(expenseController.getMonthlySummary.bind(expenseController))
);

/**
 * GET /api/v1/expenses
 * Get all expenses with filters
 */
expenseRouter.get(
  '/',
  validate(expenseFiltersValidator),
  asyncHandler(expenseController.getExpenses.bind(expenseController))
);

/**
 * GET /api/v1/expenses/:id
 * Get expense by ID
 */
expenseRouter.get(
  '/:id',
  validate(expenseIdValidator),
  asyncHandler(expenseController.getExpenseById.bind(expenseController))
);

/**
 * POST /api/v1/expenses
 * Create expense
 */
expenseRouter.post(
  '/',
  validate(createExpenseValidator),
  expenseController.createExpense.bind(expenseController) as (
    req: AuthenticatedRequest,
    ...args: Parameters<typeof expenseController.createExpense>
  ) => Promise<void>
);

/**
 * PUT /api/v1/expenses/:id
 * Update expense
 */
expenseRouter.put(
  '/:id',
  validate(updateExpenseValidator),
  asyncHandler(expenseController.updateExpense.bind(expenseController))
);

/**
 * DELETE /api/v1/expenses/:id
 * Delete expense
 */
expenseRouter.delete(
  '/:id',
  validate(expenseIdValidator),
  asyncHandler(expenseController.deleteExpense.bind(expenseController))
);

export { expenseTypeRouter, expenseRouter };
