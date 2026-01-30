/**
 * Account Controller
 * Handles HTTP requests for account management endpoints
 */

import type { Response, NextFunction } from 'express';
import { accountService } from '../services/account.service';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/response.util';
import type { AuthenticatedRequest, CreateAccountDto, UpdateAccountDto } from '../types/api.types';
import type { AccountType } from '../types/database.types';

export class AccountController {
  /**
   * GET /api/v1/accounts
   * Get all accounts with optional filters
   */
  async getAccounts(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { user, accessToken } = req;
      const { type, isActive } = req.query;

      const filters: { type?: AccountType; isActive?: boolean } = {};

      if (type) {
        filters.type = type as AccountType;
      }

      if (isActive !== undefined) {
        filters.isActive = isActive === 'true';
      }

      const accounts = await accountService.getAccounts(user.id, accessToken, filters);

      sendSuccess(res, accounts);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/accounts/:id
   * Get a specific account by ID
   */
  async getAccountById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { user, accessToken } = req;
      const { id } = req.params;

      const account = await accountService.getAccountById(user.id, id, accessToken);

      sendSuccess(res, account);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/accounts
   * Create a new account
   */
  async createAccount(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { user, accessToken } = req;
      const { name, accountType, balance } = req.body as CreateAccountDto;

      const account = await accountService.createAccount(
        user.id,
        { name, accountType, balance },
        accessToken
      );

      sendCreated(res, account, 'Account created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/accounts/:id
   * Update an existing account
   */
  async updateAccount(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { user, accessToken } = req;
      const { id } = req.params;
      const { name, isActive } = req.body as UpdateAccountDto;

      const account = await accountService.updateAccount(
        user.id,
        id,
        { name, isActive },
        accessToken
      );

      sendSuccess(res, account, 'Account updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/accounts/:id
   * Soft delete an account
   */
  async deleteAccount(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { user, accessToken } = req;
      const { id } = req.params;

      await accountService.deleteAccount(user.id, id, accessToken);

      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/accounts/summary
   * Get accounts summary for dashboard
   */
  async getAccountsSummary(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { user, accessToken } = req;

      const summary = await accountService.getAccountsSummary(user.id, accessToken);

      sendSuccess(res, summary);
    } catch (error) {
      next(error);
    }
  }
}

export const accountController = new AccountController();
