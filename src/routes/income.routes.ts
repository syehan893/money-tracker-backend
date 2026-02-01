/**
 * Income and Income Type Routes
 */

import { Router } from 'express';
import { incomeTypeController, incomeController } from '../controllers/income.controller';
import { authenticateUser } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { asyncHandler } from '../utils/asyncHandler';
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
  asyncHandler(incomeTypeController.getIncomeTypes.bind(incomeTypeController))
);

/**
 * GET /api/v1/income-types/:id
 * Get income type by ID
 */
incomeTypeRouter.get(
  '/:id',
  validate(incomeTypeIdValidator),
  asyncHandler(incomeTypeController.getIncomeTypeById.bind(incomeTypeController))
);

/**
 * POST /api/v1/income-types
 * Create income type
 */
incomeTypeRouter.post(
  '/',
  validate(createIncomeTypeValidator),
  asyncHandler(incomeTypeController.createIncomeType.bind(incomeTypeController))
);

/**
 * PUT /api/v1/income-types/:id
 * Update income type
 */
incomeTypeRouter.put(
  '/:id',
  validate(updateIncomeTypeValidator),
  asyncHandler(incomeTypeController.updateIncomeType.bind(incomeTypeController))
);

/**
 * DELETE /api/v1/income-types/:id
 * Delete income type
 */
incomeTypeRouter.delete(
  '/:id',
  validate(incomeTypeIdValidator),
  asyncHandler(incomeTypeController.deleteIncomeType.bind(incomeTypeController))
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
  asyncHandler(incomeController.getTargetProgress.bind(incomeController))
);

/**
 * GET /api/v1/incomes/monthly/:year/:month
 * Get monthly income summary
 * Note: Must come before /:id
 */
incomeRouter.get(
  '/monthly/:year/:month',
  validate(monthlySummaryValidator),
  asyncHandler(incomeController.getMonthlySummary.bind(incomeController))
);

/**
 * GET /api/v1/incomes
 * Get all incomes with filters
 */
incomeRouter.get(
  '/',
  validate(incomeFiltersValidator),
  asyncHandler(incomeController.getIncomes.bind(incomeController))
);

/**
 * GET /api/v1/incomes/:id
 * Get income by ID
 */
incomeRouter.get(
  '/:id',
  validate(incomeIdValidator),
  asyncHandler(incomeController.getIncomeById.bind(incomeController))
);

/**
 * POST /api/v1/incomes
 * Create income
 */
incomeRouter.post(
  '/',
  validate(createIncomeValidator),
  asyncHandler(incomeController.createIncome.bind(incomeController))
);

/**
 * PUT /api/v1/incomes/:id
 * Update income
 */
incomeRouter.put(
  '/:id',
  validate(updateIncomeValidator),
  asyncHandler(incomeController.updateIncome.bind(incomeController))
);

/**
 * DELETE /api/v1/incomes/:id
 * Delete income
 */
incomeRouter.delete(
  '/:id',
  validate(incomeIdValidator),
  asyncHandler(incomeController.deleteIncome.bind(incomeController))
);

export { incomeTypeRouter, incomeRouter };
