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

// ============================================
// EXPENSE TYPE ROUTES
// ============================================

const expenseTypeRouter = Router();

// All expense type routes require authentication
expenseTypeRouter.use(authenticateUser);

/**
 * @swagger
 * tags:
 *   name: Expense Types
 *   description: Expense type management
 */

/**
 * @swagger
 * /expense-types:
 *   get:
 *     summary: Get all expense types
 *     tags: [Expense Types]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of expense types
 */
expenseTypeRouter.get(
  '/',
  asyncHandler(expenseTypeController.getExpenseTypes.bind(expenseTypeController))
);

/**
 * @swagger
 * /expense-types/{id}:
 *   get:
 *     summary: Get expense type by ID
 *     tags: [Expense Types]
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
 *         description: Expense type details
 */
expenseTypeRouter.get(
  '/:id',
  validate(expenseTypeIdValidator),
  asyncHandler(expenseTypeController.getExpenseTypeById.bind(expenseTypeController))
);

/**
 * @swagger
 * /expense-types:
 *   post:
 *     summary: Create expense type
 *     tags: [Expense Types]
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
 *               budget_amount:
 *                 type: number
 *     responses:
 *       201:
 *         description: Expense type created
 */
expenseTypeRouter.post(
  '/',
  validate(createExpenseTypeValidator),
  asyncHandler(expenseTypeController.createExpenseType.bind(expenseTypeController))
);

/**
 * @swagger
 * /expense-types/{id}:
 *   put:
 *     summary: Update expense type
 *     tags: [Expense Types]
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
 *               budget_amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Expense type updated
 */
expenseTypeRouter.put(
  '/:id',
  validate(updateExpenseTypeValidator),
  asyncHandler(expenseTypeController.updateExpenseType.bind(expenseTypeController))
);

/**
 * @swagger
 * /expense-types/{id}:
 *   delete:
 *     summary: Delete expense type
 *     tags: [Expense Types]
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
 *         description: Expense type deleted
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
 * @swagger
 * tags:
 *   name: Expenses
 *   description: Expense management
 */

/**
 * @swagger
 * /expenses/budget-status:
 *   get:
 *     summary: Get budget vs actual for current month
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Budget status
 */
expenseRouter.get(
  '/budget-status',
  asyncHandler(expenseController.getBudgetStatus.bind(expenseController))
);

/**
 * @swagger
 * /expenses/monthly/{year}/{month}:
 *   get:
 *     summary: Get monthly expense summary
 *     tags: [Expenses]
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
expenseRouter.get(
  '/monthly/:year/:month',
  validate(expenseMonthlySummaryValidator),
  asyncHandler(expenseController.getMonthlySummary.bind(expenseController))
);

/**
 * @swagger
 * /expenses:
 *   get:
 *     summary: Get all expenses with filters
 *     tags: [Expenses]
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
 *         name: expenseTypeId
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
 *         description: List of expenses
 */
expenseRouter.get(
  '/',
  validate(expenseFiltersValidator),
  asyncHandler(expenseController.getExpenses.bind(expenseController))
);

/**
 * @swagger
 * /expenses/{id}:
 *   get:
 *     summary: Get expense by ID
 *     tags: [Expenses]
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
 *         description: Expense details
 */
expenseRouter.get(
  '/:id',
  validate(expenseIdValidator),
  asyncHandler(expenseController.getExpenseById.bind(expenseController))
);

/**
 * @swagger
 * /expenses:
 *   post:
 *     summary: Create expense
 *     tags: [Expenses]
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
 *               - expense_type_id
 *               - account_id
 *               - date
 *             properties:
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *               expense_type_id:
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
 *         description: Expense created
 */
expenseRouter.post(
  '/',
  validate(createExpenseValidator),
  asyncHandler(expenseController.createExpense.bind(expenseController))
);

/**
 * @swagger
 * /expenses/{id}:
 *   put:
 *     summary: Update expense
 *     tags: [Expenses]
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
 *               expense_type_id:
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
 *         description: Expense updated
 */
expenseRouter.put(
  '/:id',
  validate(updateExpenseValidator),
  asyncHandler(expenseController.updateExpense.bind(expenseController))
);

/**
 * @swagger
 * /expenses/{id}:
 *   delete:
 *     summary: Delete expense
 *     tags: [Expenses]
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
 *         description: Expense deleted
 */
expenseRouter.delete(
  '/:id',
  validate(expenseIdValidator),
  asyncHandler(expenseController.deleteExpense.bind(expenseController))
);

export { expenseTypeRouter, expenseRouter };
