/* eslint-disable @typescript-eslint/no-misused-promises */
/**
 * Dashboard Routes
 */

import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller';
import { authenticateUser } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import { param } from 'express-validator';

const router = Router();

// All dashboard routes require authentication
router.use(authenticateUser);

/**
 * Validation for monthly summary parameters
 */
const monthlySummaryValidator = [
  param('year').isInt({ min: 2000, max: 2100 }).withMessage('Year must be between 2000 and 2100'),

  param('month').isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12'),
];

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dashboard analytics
 */

/**
 * @swagger
 * /dashboard/overview:
 *   get:
 *     summary: Get financial overview
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Overview data
 */
router.get('/overview', asyncHandler(dashboardController.getOverview.bind(dashboardController)));

/**
 * @swagger
 * /dashboard/monthly-summary/{year}/{month}:
 *   get:
 *     summary: Get monthly summary
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: month
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Monthly summary
 */
router.get(
  '/monthly-summary/:year/:month',
  validate(monthlySummaryValidator),
  asyncHandler(dashboardController.getMonthlySummary.bind(dashboardController))
);

/**
 * @swagger
 * /dashboard/trends:
 *   get:
 *     summary: Get financial trends
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trends data
 */
router.get('/trends', asyncHandler(dashboardController.getTrends.bind(dashboardController)));

export default router;
