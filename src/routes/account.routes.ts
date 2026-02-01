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
import type { AuthenticatedRequest } from '../types/api.types';

const router = Router();

// All account routes require authentication
router.use(authenticateUser);

/**
 * GET /api/v1/accounts/summary
 * Get accounts summary for dashboard
 * Note: This must come before /:id to avoid treating "summary" as an ID
 */
router.get('/summary', asyncHandler(accountController.getAccountsSummary.bind(accountController)));

/**
 * GET /api/v1/accounts
 * Get all accounts with optional filters
 */
router.get(
  '/',
  validate(accountFiltersValidator),
  asyncHandler(accountController.getAccounts.bind(accountController))
);

/**
 * GET /api/v1/accounts/:id
 * Get a specific account by ID
 */
router.get(
  '/:id',
  validate(accountIdValidator),
  asyncHandler(accountController.getAccountById.bind(accountController))
);

/**
 * POST /api/v1/accounts
 * Create a new account
 */
router.post(
  '/',
  validate(createAccountValidator),
  accountController.createAccount.bind(accountController) as (
    req: AuthenticatedRequest,
    ...args: Parameters<typeof accountController.createAccount>
  ) => Promise<void>
);

/**
 * PUT /api/v1/accounts/:id
 * Update an existing account
 */
router.put(
  '/:id',
  validate(updateAccountValidator),
  accountController.updateAccount.bind(accountController) as (
    req: AuthenticatedRequest,
    ...args: Parameters<typeof accountController.updateAccount>
  ) => Promise<void>
);

/**
 * DELETE /api/v1/accounts/:id
 * Soft delete an account
 */
router.delete(
  '/:id',
  validate(accountIdValidator),
  asyncHandler(accountController.deleteAccount.bind(accountController))
);

export default router;
