/**
 * Income and Income Type Routes
 */

import { Router } from 'express';
import { incomeTypeController, incomeController } from '../controllers/income.controller';
import { authenticateUser } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createIncomeTypeValidator,
  updateIncomeTypeValidator,
  incomeTypeIdValidator,
  createIncomeValidator,
  updateIncomeValidator,
  incomeIdValidator,
  incomeFiltersValidator,
  monthlySummaryValidator,
} from '../validators/income.validator';
import type { AuthenticatedRequest } from '../types/api.types';

// ============================================
// INCOME TYPE ROUTES
// ============================================

const incomeTypeRouter = Router();

// All income type routes require authentication
incomeTypeRouter.use(authenticateUser);

/**
 * GET /api/v1/income-types
 * Get all income types
 */
incomeTypeRouter.get(
  '/',
  incomeTypeController.getIncomeTypes.bind(incomeTypeController) as (
    req: AuthenticatedRequest,
    ...args: Parameters<typeof incomeTypeController.getIncomeTypes>
  ) => Promise<void>
);

/**
 * GET /api/v1/income-types/:id
 * Get income type by ID
 */
incomeTypeRouter.get(
  '/:id',
  validate(incomeTypeIdValidator),
  incomeTypeController.getIncomeTypeById.bind(incomeTypeController) as (
    req: AuthenticatedRequest,
    ...args: Parameters<typeof incomeTypeController.getIncomeTypeById>
  ) => Promise<void>
);

/**
 * POST /api/v1/income-types
 * Create income type
 */
incomeTypeRouter.post(
  '/',
  validate(createIncomeTypeValidator),
  incomeTypeController.createIncomeType.bind(incomeTypeController) as (
    req: AuthenticatedRequest,
    ...args: Parameters<typeof incomeTypeController.createIncomeType>
  ) => Promise<void>
);

/**
 * PUT /api/v1/income-types/:id
 * Update income type
 */
incomeTypeRouter.put(
  '/:id',
  validate(updateIncomeTypeValidator),
  incomeTypeController.updateIncomeType.bind(incomeTypeController) as (
    req: AuthenticatedRequest,
    ...args: Parameters<typeof incomeTypeController.updateIncomeType>
  ) => Promise<void>
);

/**
 * DELETE /api/v1/income-types/:id
 * Delete income type
 */
incomeTypeRouter.delete(
  '/:id',
  validate(incomeTypeIdValidator),
  incomeTypeController.deleteIncomeType.bind(incomeTypeController) as (
    req: AuthenticatedRequest,
    ...args: Parameters<typeof incomeTypeController.deleteIncomeType>
  ) => Promise<void>
);

// ============================================
// INCOME ROUTES
// ============================================

const incomeRouter = Router();

// All income routes require authentication
incomeRouter.use(authenticateUser);

/**
 * GET /api/v1/incomes/target-progress
 * Get target vs actual progress
 * Note: Must come before /:id
 */
incomeRouter.get(
  '/target-progress',
  incomeController.getTargetProgress.bind(incomeController) as (
    req: AuthenticatedRequest,
    ...args: Parameters<typeof incomeController.getTargetProgress>
  ) => Promise<void>
);

/**
 * GET /api/v1/incomes/monthly/:year/:month
 * Get monthly income summary
 * Note: Must come before /:id
 */
incomeRouter.get(
  '/monthly/:year/:month',
  validate(monthlySummaryValidator),
  incomeController.getMonthlySummary.bind(incomeController) as (
    req: AuthenticatedRequest,
    ...args: Parameters<typeof incomeController.getMonthlySummary>
  ) => Promise<void>
);

/**
 * GET /api/v1/incomes
 * Get all incomes with filters
 */
incomeRouter.get(
  '/',
  validate(incomeFiltersValidator),
  incomeController.getIncomes.bind(incomeController) as (
    req: AuthenticatedRequest,
    ...args: Parameters<typeof incomeController.getIncomes>
  ) => Promise<void>
);

/**
 * GET /api/v1/incomes/:id
 * Get income by ID
 */
incomeRouter.get(
  '/:id',
  validate(incomeIdValidator),
  incomeController.getIncomeById.bind(incomeController) as (
    req: AuthenticatedRequest,
    ...args: Parameters<typeof incomeController.getIncomeById>
  ) => Promise<void>
);

/**
 * POST /api/v1/incomes
 * Create income
 */
incomeRouter.post(
  '/',
  validate(createIncomeValidator),
  incomeController.createIncome.bind(incomeController) as (
    req: AuthenticatedRequest,
    ...args: Parameters<typeof incomeController.createIncome>
  ) => Promise<void>
);

/**
 * PUT /api/v1/incomes/:id
 * Update income
 */
incomeRouter.put(
  '/:id',
  validate(updateIncomeValidator),
  incomeController.updateIncome.bind(incomeController) as (
    req: AuthenticatedRequest,
    ...args: Parameters<typeof incomeController.updateIncome>
  ) => Promise<void>
);

/**
 * DELETE /api/v1/incomes/:id
 * Delete income
 */
incomeRouter.delete(
  '/:id',
  validate(incomeIdValidator),
  incomeController.deleteIncome.bind(incomeController) as (
    req: AuthenticatedRequest,
    ...args: Parameters<typeof incomeController.deleteIncome>
  ) => Promise<void>
);

export { incomeTypeRouter, incomeRouter };
