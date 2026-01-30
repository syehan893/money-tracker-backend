/**
 * Transfer validation schemas
 */

import { body, param, query } from 'express-validator';

/**
 * Validation for creating a transfer
 */
export const createTransferValidator = [
  body('fromAccountId')
    .notEmpty()
    .withMessage('From account ID is required')
    .isUUID()
    .withMessage('Invalid from account ID format'),

  body('toAccountId')
    .notEmpty()
    .withMessage('To account ID is required')
    .isUUID()
    .withMessage('Invalid to account ID format')
    .custom((value, { req }) => {
      const body = req.body as { fromAccountId?: string };
      if (value === body.fromAccountId) {
        throw new Error('Cannot transfer to the same account');
      }
      return true;
    }),

  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ gt: 0 })
    .withMessage('Amount must be a positive number'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),

  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .isISO8601()
    .withMessage('Date must be in ISO format (YYYY-MM-DD)'),
];

/**
 * Validation for transfer ID parameter
 */
export const transferIdValidator = [
  param('id').isUUID().withMessage('Invalid transfer ID format'),
];

/**
 * Validation for transfer list filters
 */
export const transferFiltersValidator = [
  query('accountId')
    .optional()
    .isUUID()
    .withMessage('Invalid account ID format'),

  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be in ISO format (YYYY-MM-DD)'),

  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be in ISO format (YYYY-MM-DD)'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];
