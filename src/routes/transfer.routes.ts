/* eslint-disable @typescript-eslint/no-misused-promises */
/**
 * Transfer Routes
 */

import { Router } from 'express';
import { transferController } from '../controllers/transfer.controller';
import { authenticateUser } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import {
  createTransferValidator,
  transferIdValidator,
  transferFiltersValidator,
} from '../validators/transfer.validator';

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
  asyncHandler(transferController.getTransfers.bind(transferController))
);

/**
 * GET /api/v1/transfers/:id
 * Get transfer by ID
 */
router.get(
  '/:id',
  validate(transferIdValidator),
  asyncHandler(transferController.getTransferById.bind(transferController))
);

/**
 * POST /api/v1/transfers
 * Create transfer
 */
router.post(
  '/',
  validate(createTransferValidator),
  asyncHandler(transferController.createTransfer.bind(transferController))
);

/**
 * DELETE /api/v1/transfers/:id
 * Delete transfer
 */
router.delete(
  '/:id',
  validate(transferIdValidator),
  asyncHandler(transferController.deleteTransfer.bind(transferController))
);

export default router;
