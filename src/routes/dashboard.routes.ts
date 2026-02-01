/**
 * Dashboard Routes
 */

import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller';
import { authenticateUser } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { param } from 'express-validator';
import type { AuthenticatedRequest } from '../types/api.types';

const router = Router();

// All dashboard routes require authentication
router.use(authenticateUser);

/**
 * Validation for monthly summary parameters
 */
const monthlySummaryValidator = [
  param('year')
    .isInt({ min: 2000, max: 2100 })
    .withMessage('Year must be between 2000 and 2100'),

  param('month')
    .isInt({ min: 1, max: 12 })
    .withMessage('Month must be between 1 and 12'),
];

/**
 * GET /api/v1/dashboard/overview
 * Get complete financial overview
 */
router.get(
  '/overview',
  dashboardController.getOverview.bind(dashboardController) as (
    req: AuthenticatedRequest,
    ...args: Parameters<typeof dashboardController.getOverview>
  ) => Promise<void>
);

/**
 * GET /api/v1/dashboard/monthly-summary/:year/:month
 * Get monthly breakdown summary
 */
router.get(
  '/monthly-summary/:year/:month',
  validate(monthlySummaryValidator),
  dashboardController.getMonthlySummary.bind(dashboardController) as (
    req: AuthenticatedRequest,
    ...args: Parameters<typeof dashboardController.getMonthlySummary>
  ) => Promise<void>
);

/**
 * GET /api/v1/dashboard/trends
 * Get financial trends
 */
router.get(
  '/trends',
  dashboardController.getTrends.bind(dashboardController) as (
    req: AuthenticatedRequest,
    ...args: Parameters<typeof dashboardController.getTrends>
  ) => Promise<void>
);

export default router;
