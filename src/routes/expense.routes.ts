/**
 * Expense and Expense Type Routes
 */

import { Router } from 'express';
import { expenseTypeController, expenseController } from '../controllers/expense.controller';
import { authenticateUser } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
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
  expenseTypeController.getExpenseTypes.bind(expenseTypeController) as (
    req: AuthenticatedRequest,
    ...args: Parameters<typeof expenseTypeController.getExpenseTypes>
  ) => Promise<void>
);

/**
 * GET /api/v1/expense-types/:id
 * Get expense type by ID
 */
expenseTypeRouter.get(
  '/:id',
  validate(expenseTypeIdValidator),
  expenseTypeController.getExpenseTypeById.bind(expenseTypeController) as (
    req: AuthenticatedRequest,
    ...args: Parameters<typeof expenseTypeController.getExpenseTypeById>
  ) => Promise<void>
);

/**
 * POST /api/v1/expense-types
 * Create expense type
 */
expenseTypeRouter.post(
  '/',
  validate(createExpenseTypeValidator),
  expenseTypeController.createExpenseType.bind(expenseTypeController) as (
    req: AuthenticatedRequest,
    ...args: Parameters<typeof expenseTypeController.createExpenseType>
  ) => Promise<void>
);

/**
 * PUT /api/v1/expense-types/:id
 * Update expense type
 */
expenseTypeRouter.put(
  '/:id',
  validate(updateExpenseTypeValidator),
  expenseTypeController.updateExpenseType.bind(expenseTypeController) as (
    req: AuthenticatedRequest,
    ...args: Parameters<typeof expenseTypeController.updateExpenseType>
  ) => Promise<void>
);

/**
 * DELETE /api/v1/expense-types/:id
 * Delete expense type
 */
expenseTypeRouter.delete(
  '/:id',
  validate(expenseTypeIdValidator),
  expenseTypeController.deleteExpenseType.bind(expenseTypeController) as (
    req: AuthenticatedRequest,
    ...args: Parameters<typeof expenseTypeController.deleteExpenseType>
  ) => Promise<void>
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
  expenseController.getBudgetStatus.bind(expenseController) as (
    req: AuthenticatedRequest,
    ...args: Parameters<typeof expenseController.getBudgetStatus>
  ) => Promise<void>
);

/**
 * GET /api/v1/expenses/monthly/:year/:month
 * Get monthly expense summary
 * Note: Must come before /:id
 */
expenseRouter.get(
  '/monthly/:year/:month',
  validate(expenseMonthlySummaryValidator),
  expenseController.getMonthlySummary.bind(expenseController) as (
    req: AuthenticatedRequest,
    ...args: Parameters<typeof expenseController.getMonthlySummary>
  ) => Promise<void>
);

/**
 * GET /api/v1/expenses
 * Get all expenses with filters
 */
expenseRouter.get(
  '/',
  validate(expenseFiltersValidator),
  expenseController.getExpenses.bind(expenseController) as (
    req: AuthenticatedRequest,
    ...args: Parameters<typeof expenseController.getExpenses>
  ) => Promise<void>
);

/**
 * GET /api/v1/expenses/:id
 * Get expense by ID
 */
expenseRouter.get(
  '/:id',
  validate(expenseIdValidator),
  expenseController.getExpenseById.bind(expenseController) as (
    req: AuthenticatedRequest,
    ...args: Parameters<typeof expenseController.getExpenseById>
  ) => Promise<void>
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
  expenseController.updateExpense.bind(expenseController) as (
    req: AuthenticatedRequest,
    ...args: Parameters<typeof expenseController.updateExpense>
  ) => Promise<void>
);

/**
 * DELETE /api/v1/expenses/:id
 * Delete expense
 */
expenseRouter.delete(
  '/:id',
  validate(expenseIdValidator),
  expenseController.deleteExpense.bind(expenseController) as (
    req: AuthenticatedRequest,
    ...args: Parameters<typeof expenseController.deleteExpense>
  ) => Promise<void>
);

export { expenseTypeRouter, expenseRouter };
