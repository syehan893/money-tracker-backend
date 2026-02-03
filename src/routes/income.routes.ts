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
 * @swagger
 * tags:
 *   name: Income Types
 *   description: Income type management
 */

/**
 * @swagger
 * /income-types:
 *   get:
 *     summary: Get all income types
 *     tags: [Income Types]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of income types
 */
incomeTypeRouter.get(
  '/',
  asyncHandler(incomeTypeController.getIncomeTypes.bind(incomeTypeController))
);

/**
 * @swagger
 * /income-types/{id}:
 *   get:
 *     summary: Get income type by ID
 *     tags: [Income Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Income type details
 *       404:
 *         description: Income type not found
 */
incomeTypeRouter.get(
  '/:id',
  validate(incomeTypeIdValidator),
  asyncHandler(incomeTypeController.getIncomeTypeById.bind(incomeTypeController))
);

/**
 * @swagger
 * /income-types:
 *   post:
 *     summary: Create income type
 *     tags: [Income Types]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               target_amount:
 *                 type: number
 *     responses:
 *       201:
 *         description: Income type created
 */
incomeTypeRouter.post(
  '/',
  validate(createIncomeTypeValidator),
  asyncHandler(incomeTypeController.createIncomeType.bind(incomeTypeController))
);

/**
 * @swagger
 * /income-types/{id}:
 *   put:
 *     summary: Update income type
 *     tags: [Income Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               target_amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Income type updated
 */
incomeTypeRouter.put(
  '/:id',
  validate(updateIncomeTypeValidator),
  asyncHandler(incomeTypeController.updateIncomeType.bind(incomeTypeController))
);

/**
 * @swagger
 * /income-types/{id}:
 *   delete:
 *     summary: Delete income type
 *     tags: [Income Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Income type deleted
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
 * @swagger
 * tags:
 *   name: Incomes
 *   description: Income management
 */

/**
 * @swagger
 * /incomes/target-progress:
 *   get:
 *     summary: Get target vs actual progress
 *     tags: [Incomes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Target progress
 */
incomeRouter.get(
  '/target-progress',
  asyncHandler(incomeController.getTargetProgress.bind(incomeController))
);

/**
 * @swagger
 * /incomes/monthly/{year}/{month}:
 *   get:
 *     summary: Get monthly income summary
 *     tags: [Incomes]
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
incomeRouter.get(
  '/monthly/:year/:month',
  validate(monthlySummaryValidator),
  asyncHandler(incomeController.getMonthlySummary.bind(incomeController))
);

/**
 * @swagger
 * /incomes:
 *   get:
 *     summary: Get all incomes with filters
 *     tags: [Incomes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: incomeTypeId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: List of incomes
 */
incomeRouter.get(
  '/',
  validate(incomeFiltersValidator),
  asyncHandler(incomeController.getIncomes.bind(incomeController))
);

/**
 * @swagger
 * /incomes/{id}:
 *   get:
 *     summary: Get income by ID
 *     tags: [Incomes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Income details
 */
incomeRouter.get(
  '/:id',
  validate(incomeIdValidator),
  asyncHandler(incomeController.getIncomeById.bind(incomeController))
);

/**
 * @swagger
 * /incomes:
 *   post:
 *     summary: Create income
 *     tags: [Incomes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - income_type_id
 *               - account_id
 *               - date
 *             properties:
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *               income_type_id:
 *                 type: string
 *                 format: uuid
 *               account_id:
 *                 type: string
 *                 format: uuid
 *               date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Income created
 */
incomeRouter.post(
  '/',
  validate(createIncomeValidator),
  asyncHandler(incomeController.createIncome.bind(incomeController))
);

/**
 * @swagger
 * /incomes/{id}:
 *   put:
 *     summary: Update income
 *     tags: [Incomes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *               income_type_id:
 *                 type: string
 *                 format: uuid
 *               account_id:
 *                 type: string
 *                 format: uuid
 *               date:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Income updated
 */
incomeRouter.put(
  '/:id',
  validate(updateIncomeValidator),
  asyncHandler(incomeController.updateIncome.bind(incomeController))
);

/**
 * @swagger
 * /incomes/{id}:
 *   delete:
 *     summary: Delete income
 *     tags: [Incomes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Income deleted
 */
incomeRouter.delete(
  '/:id',
  validate(incomeIdValidator),
  asyncHandler(incomeController.deleteIncome.bind(incomeController))
);

export { incomeTypeRouter, incomeRouter };
