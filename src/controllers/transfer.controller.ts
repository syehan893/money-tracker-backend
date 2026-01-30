/**
 * Transfer Controller
 * Handles HTTP requests for transfer management endpoints
 */

import type { Response, NextFunction } from 'express';
import { transferService } from '../services/transfer.service';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/response.util';
import type { AuthenticatedRequest, CreateTransferDto } from '../types/api.types';

export class TransferController {
  /**
   * GET /api/v1/transfers
   * Get all transfers with filters and pagination
   */
  async getTransfers(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { user, accessToken } = req;
      const { accountId, startDate, endDate, page, limit } = req.query as {
        accountId?: string;
        startDate?: string;
        endDate?: string;
        page?: string;
        limit?: string;
      };

      const result = await transferService.getTransfers(user.id, accessToken, {
        accountId,
        startDate,
        endDate,
        page: page ? parseInt(page, 10) : undefined,
        limit: limit ? parseInt(limit, 10) : undefined,
      });

      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/transfers/:id
   * Get transfer by ID
   */
  async getTransferById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { user, accessToken } = req;
      const { id } = req.params;

      const transfer = await transferService.getTransferById(user.id, id, accessToken);

      sendSuccess(res, transfer);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/transfers
   * Create transfer
   */
  async createTransfer(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { user, accessToken } = req;
      const { fromAccountId, toAccountId, amount, description, date } =
        req.body as CreateTransferDto;

      const transfer = await transferService.createTransfer(
        user.id,
        { fromAccountId, toAccountId, amount, description, date },
        accessToken
      );

      sendCreated(res, transfer, 'Transfer completed successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/transfers/:id
   * Delete transfer
   */
  async deleteTransfer(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { user, accessToken } = req;
      const { id } = req.params;

      await transferService.deleteTransfer(user.id, id, accessToken);

      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  }
}

export const transferController = new TransferController();
