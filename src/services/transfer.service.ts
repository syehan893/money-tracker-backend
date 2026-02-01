/**
 * Transfer Service
 * Handles business logic for transfer management
 */

import { transferRepository, type TransferFilters } from '../repositories/transfer.repository';
import { accountService } from './account.service';
import {
  NotFoundError,
  ValidationError,
  InsufficientBalanceError,
} from '../middleware/error.middleware';
import type { CreateTransferDto, PaginatedResponse } from '../types/api.types';
import type { TransferWithRelations } from '../types/database.types';
import { parsePaginationParams } from '../utils/validation.util';

export class TransferService {
  /**
   * Get all transfers with filters and pagination
   */
  async getTransfers(
    userId: string,
    accessToken: string,
    filters?: TransferFilters & { page?: number; limit?: number }
  ): Promise<PaginatedResponse<TransferWithRelations>> {
    const { page, limit, offset } = parsePaginationParams(filters?.page, filters?.limit);

    const { transfers, total } = await transferRepository.findAll(
      userId,
      accessToken,
      {
        accountId: filters?.accountId,
        startDate: filters?.startDate,
        endDate: filters?.endDate,
      },
      offset,
      limit
    );

    return {
      items: transfers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    };
  }

  /**
   * Get transfer by ID
   */
  async getTransferById(
    userId: string,
    transferId: string,
    accessToken: string
  ): Promise<TransferWithRelations> {
    const transfer = await transferRepository.findById(userId, transferId, accessToken);

    if (!transfer) {
      throw new NotFoundError('Transfer', transferId);
    }

    return transfer;
  }

  /**
   * Create a new transfer
   */
  async createTransfer(
    userId: string,
    data: CreateTransferDto,
    accessToken: string
  ): Promise<TransferWithRelations> {
    const { fromAccountId, toAccountId, amount, description, date } = data;

    // Validate accounts are different
    if (fromAccountId === toAccountId) {
      throw new ValidationError('Cannot transfer to the same account');
    }

    // Validate source account exists and belongs to user
    const fromAccount = await accountService.validateAccountOwnership(
      userId,
      fromAccountId,
      accessToken
    );

    // Check sufficient balance in source account
    if (Number(fromAccount.balance) < amount) {
      throw new InsufficientBalanceError(fromAccountId, amount, Number(fromAccount.balance));
    }

    // Validate destination account exists and belongs to user
    await accountService.validateAccountOwnership(userId, toAccountId, accessToken);

    // Amount validation
    if (amount <= 0) {
      throw new ValidationError('Amount must be a positive number');
    }

    return transferRepository.create(
      userId,
      {
        from_account_id: fromAccountId,
        to_account_id: toAccountId,
        amount,
        description: description || null,
        date,
      },
      accessToken
    );
  }

  /**
   * Delete a transfer
   * Note: Updates to transfers are not allowed - delete and recreate instead
   */
  async deleteTransfer(userId: string, transferId: string, accessToken: string): Promise<void> {
    // Check if transfer exists
    const existing = await transferRepository.findById(userId, transferId, accessToken);
    if (!existing) {
      throw new NotFoundError('Transfer', transferId);
    }

    await transferRepository.delete(userId, transferId, accessToken);
  }
}

export const transferService = new TransferService();
