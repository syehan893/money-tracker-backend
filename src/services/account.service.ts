/**
 * Account Service
 * Handles business logic for account management
 */

import { accountRepository, type AccountFilters } from '../repositories/account.repository';
import { NotFoundError, ValidationError } from '../middleware/error.middleware';
import type { CreateAccountDto, UpdateAccountDto, AccountSummary } from '../types/api.types';
import type { Account, AccountType } from '../types/database.types';

export class AccountService {
  /**
   * Get all accounts for a user with optional filters
   */
  async getAccounts(
    userId: string,
    accessToken: string,
    filters?: AccountFilters
  ): Promise<Account[]> {
    return accountRepository.findAll(userId, accessToken, filters);
  }

  /**
   * Get a specific account by ID
   */
  async getAccountById(userId: string, accountId: string, accessToken: string): Promise<Account> {
    const account = await accountRepository.findById(userId, accountId, accessToken);

    if (!account) {
      throw new NotFoundError('Account', accountId);
    }

    return account;
  }

  /**
   * Create a new account
   */
  async createAccount(
    userId: string,
    data: CreateAccountDto,
    accessToken: string
  ): Promise<Account> {
    const { name, accountType, balance = 0 } = data;

    // Validate balance
    if (balance < 0) {
      throw new ValidationError('Balance cannot be negative');
    }

    return accountRepository.create(
      userId,
      {
        name,
        account_type: accountType as AccountType,
        balance,
      },
      accessToken
    );
  }

  /**
   * Update an existing account
   */
  async updateAccount(
    userId: string,
    accountId: string,
    data: UpdateAccountDto,
    accessToken: string
  ): Promise<Account> {
    // Check if account exists
    const existingAccount = await accountRepository.findById(userId, accountId, accessToken);

    if (!existingAccount) {
      throw new NotFoundError('Account', accountId);
    }

    const updateData: { name?: string; is_active?: boolean } = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
    }

    if (data.isActive !== undefined) {
      updateData.is_active = data.isActive;
    }

    return accountRepository.update(userId, accountId, updateData, accessToken);
  }

  /**
   * Soft delete an account (set is_active to false)
   */
  async deleteAccount(userId: string, accountId: string, accessToken: string): Promise<void> {
    // Check if account exists
    const existingAccount = await accountRepository.findById(userId, accountId, accessToken);

    if (!existingAccount) {
      throw new NotFoundError('Account', accountId);
    }

    await accountRepository.delete(userId, accountId, accessToken);
  }

  /**
   * Get accounts summary for dashboard
   */
  async getAccountsSummary(userId: string, accessToken: string): Promise<AccountSummary> {
    return accountRepository.getSummary(userId, accessToken);
  }

  /**
   * Validate that an account exists, is active, and belongs to the user
   * Throws error if validation fails
   */
  async validateAccountOwnership(
    userId: string,
    accountId: string,
    accessToken: string
  ): Promise<Account> {
    const account = await accountRepository.findById(userId, accountId, accessToken);

    if (!account) {
      throw new NotFoundError('Account', accountId);
    }

    if (!account.is_active) {
      throw new ValidationError('Account is inactive');
    }

    return account;
  }

  /**
   * Check if account has sufficient balance
   */
  async checkSufficientBalance(
    userId: string,
    accountId: string,
    requiredAmount: number,
    accessToken: string
  ): Promise<boolean> {
    const balance = await accountRepository.getBalance(userId, accountId, accessToken);

    if (balance === null) {
      throw new NotFoundError('Account', accountId);
    }

    return balance >= requiredAmount;
  }
}

export const accountService = new AccountService();
