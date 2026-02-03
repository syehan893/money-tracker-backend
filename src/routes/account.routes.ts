/* eslint-disable @typescript-eslint/no-misused-promises */
/**
 * Account Routes
 */

import { Router } from 'express';
import { accountController } from '../controllers/account.controller';
import { authenticateUser } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import {
  createAccountValidator,
  updateAccountValidator,
  accountIdValidator,
  accountFiltersValidator,
} from '../validators/account.validator';

const router = Router();

// All account routes require authentication
router.use(authenticateUser);

/**
 * @swagger
 * tags:
 *   name: Accounts
 *   description: Account management
 */

/**
 * @swagger
 * /accounts/summary:
 *   get:
 *     summary: Get accounts summary
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Accounts summary
 */
router.get('/summary', asyncHandler(accountController.getAccountsSummary.bind(accountController)));

/**
 * @swagger
 * /accounts:
 *   get:
 *     summary: Get all accounts
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of accounts
 */
router.get(
  '/',
  validate(accountFiltersValidator),
  asyncHandler(accountController.getAccounts.bind(accountController))
);

/**
 * @swagger
 * /accounts/{id}:
 *   get:
 *     summary: Get account by ID
 *     tags: [Accounts]
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
 *         description: Account details
 */
router.get(
  '/:id',
  validate(accountIdValidator),
  asyncHandler(accountController.getAccountById.bind(accountController))
);

/**
 * @swagger
 * /accounts:
 *   post:
 *     summary: Create account
 *     tags: [Accounts]
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
 *               - type
 *               - balance
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [CASH, BANK, CREDIT, WALLET, INVESTMENT, OTHER]
 *               balance:
 *                 type: number
 *               currency:
 *                 type: string
 *     responses:
 *       201:
 *         description: Account created
 */
router.post(
  '/',
  validate(createAccountValidator),
  asyncHandler(accountController.createAccount.bind(accountController))
);

/**
 * @swagger
 * /accounts/{id}:
 *   put:
 *     summary: Update account
 *     tags: [Accounts]
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
 *               type:
 *                 type: string
 *               balance:
 *                 type: number
 *               currency:
 *                 type: string
 *     responses:
 *       200:
 *         description: Account updated
 */
router.put(
  '/:id',
  validate(updateAccountValidator),
  asyncHandler(accountController.updateAccount.bind(accountController))
);

/**
 * @swagger
 * /accounts/{id}:
 *   delete:
 *     summary: Delete account
 *     tags: [Accounts]
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
 *         description: Account deleted
 */
router.delete(
  '/:id',
  validate(accountIdValidator),
  asyncHandler(accountController.deleteAccount.bind(accountController))
);

export default router;
