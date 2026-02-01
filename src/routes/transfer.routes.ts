/**
 * Transfer Routes
 */

import { Router } from 'express';
import { transferController } from '../controllers/transfer.controller';
import { authenticateUser } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createTransferValidator,
  transferIdValidator,
  transferFiltersValidator,
} from '../validators/transfer.validator';
import type { AuthenticatedRequest } from '../types/api.types';

const router = Router();

// All transfer routes require authentication
router.use(authenticateUser);

/**
 * GET /api/v1/transfers
 * Get all transfers with filters
 */
router.get(
  '/',
  validate(transferFiltersValidator),
  transferController.getTransfers.bind(transferController) as (
    req: AuthenticatedRequest,
    ...args: Parameters<typeof transferController.getTransfers>
  ) => Promise<void>
);

/**
 * GET /api/v1/transfers/:id
 * Get transfer by ID
 */
router.get(
  '/:id',
  validate(transferIdValidator),
  transferController.getTransferById.bind(transferController) as (
    req: AuthenticatedRequest,
    ...args: Parameters<typeof transferController.getTransferById>
  ) => Promise<void>
);

/**
 * POST /api/v1/transfers
 * Create transfer
 */
router.post(
  '/',
  validate(createTransferValidator),
  transferController.createTransfer.bind(transferController) as (
    req: AuthenticatedRequest,
    ...args: Parameters<typeof transferController.createTransfer>
  ) => Promise<void>
);

/**
 * DELETE /api/v1/transfers/:id
 * Delete transfer
 */
router.delete(
  '/:id',
  validate(transferIdValidator),
  transferController.deleteTransfer.bind(transferController) as (
    req: AuthenticatedRequest,
    ...args: Parameters<typeof transferController.deleteTransfer>
  ) => Promise<void>
);

export default router;
