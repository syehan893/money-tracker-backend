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
 * @swagger
 * tags:
 *   name: Transfers
 *   description: Transfer management
 */

/**
 * @swagger
 * /transfers:
 *   get:
 *     summary: Get all transfers
 *     tags: [Transfers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: accountId
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
 *         description: List of transfers
 */
router.get(
  '/',
  validate(transferFiltersValidator),
  asyncHandler(transferController.getTransfers.bind(transferController))
);

/**
 * @swagger
 * /transfers/{id}:
 *   get:
 *     summary: Get transfer by ID
 *     tags: [Transfers]
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
 *         description: Transfer details
 */
router.get(
  '/:id',
  validate(transferIdValidator),
  asyncHandler(transferController.getTransferById.bind(transferController))
);

/**
 * @swagger
 * /transfers:
 *   post:
 *     summary: Create transfer
 *     tags: [Transfers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fromAccountId
 *               - toAccountId
 *               - amount
 *               - date
 *             properties:
 *               fromAccountId:
 *                 type: string
 *                 format: uuid
 *               toAccountId:
 *                 type: string
 *                 format: uuid
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Transfer created
 */
router.post(
  '/',
  validate(createTransferValidator),
  asyncHandler(transferController.createTransfer.bind(transferController))
);

/**
 * @swagger
 * /transfers/{id}:
 *   delete:
 *     summary: Delete transfer
 *     tags: [Transfers]
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
 *         description: Transfer deleted
 */
router.delete(
  '/:id',
  validate(transferIdValidator),
  asyncHandler(transferController.deleteTransfer.bind(transferController))
);

export default router;
