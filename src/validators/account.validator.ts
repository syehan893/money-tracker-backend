/**
 * Account validation schemas
 */

import { body, param, query } from 'express-validator';
import { ACCOUNT_TYPE_VALUES } from '../config/constants';

/**
 * Validation for creating an account
 */
export const createAccountValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Account name is required')
    .isLength({ min: 1, max: 255 })
    .withMessage('Account name must be between 1 and 255 characters'),

  body('accountType')
    .notEmpty()
    .withMessage('Account type is required')
    .isIn(ACCOUNT_TYPE_VALUES)
    .withMessage(`Account type must be one of: ${ACCOUNT_TYPE_VALUES.join(', ')}`),

  body('balance')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Balance must be a non-negative number'),
];

/**
 * Validation for updating an account
 */
export const updateAccountValidator = [
  param('id').isUUID().withMessage('Invalid account ID format'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Account name must be between 1 and 255 characters'),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),
];

/**
 * Validation for account ID parameter
 */
export const accountIdValidator = [
  param('id').isUUID().withMessage('Invalid account ID format'),
];

/**
 * Validation for account list filters
 */
export const accountFiltersValidator = [
  query('type')
    .optional()
    .isIn(ACCOUNT_TYPE_VALUES)
    .withMessage(`Account type must be one of: ${ACCOUNT_TYPE_VALUES.join(', ')}`),

  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),
];
