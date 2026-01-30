/**
 * Income and Income Type validation schemas
 */

import { body, param, query } from 'express-validator';

// ============================================
// INCOME TYPE VALIDATORS
// ============================================

/**
 * Validation for creating an income type
 */
export const createIncomeTypeValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Income type name is required')
    .isLength({ min: 1, max: 255 })
    .withMessage('Income type name must be between 1 and 255 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),

  body('targetAmount')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Target amount must be a positive number'),
];

/**
 * Validation for updating an income type
 */
export const updateIncomeTypeValidator = [
  param('id').isUUID().withMessage('Invalid income type ID format'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Income type name must be between 1 and 255 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),

  body('targetAmount')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Target amount must be a positive number'),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),
];

/**
 * Validation for income type ID parameter
 */
export const incomeTypeIdValidator = [
  param('id').isUUID().withMessage('Invalid income type ID format'),
];

// ============================================
// INCOME VALIDATORS
// ============================================

/**
 * Validation for creating an income
 */
export const createIncomeValidator = [
  body('accountId')
    .notEmpty()
    .withMessage('Account ID is required')
    .isUUID()
    .withMessage('Invalid account ID format'),

  body('incomeTypeId')
    .notEmpty()
    .withMessage('Income type ID is required')
    .isUUID()
    .withMessage('Invalid income type ID format'),

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
 * Validation for updating an income
 */
export const updateIncomeValidator = [
  param('id').isUUID().withMessage('Invalid income ID format'),

  body('accountId')
    .optional()
    .isUUID()
    .withMessage('Invalid account ID format'),

  body('incomeTypeId')
    .optional()
    .isUUID()
    .withMessage('Invalid income type ID format'),

  body('amount')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Amount must be a positive number'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),

  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be in ISO format (YYYY-MM-DD)'),
];

/**
 * Validation for income ID parameter
 */
export const incomeIdValidator = [
  param('id').isUUID().withMessage('Invalid income ID format'),
];

/**
 * Validation for income list filters
 */
export const incomeFiltersValidator = [
  query('accountId')
    .optional()
    .isUUID()
    .withMessage('Invalid account ID format'),

  query('incomeTypeId')
    .optional()
    .isUUID()
    .withMessage('Invalid income type ID format'),

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

/**
 * Validation for monthly summary parameters
 */
export const monthlySummaryValidator = [
  param('year')
    .isInt({ min: 2000, max: 2100 })
    .withMessage('Year must be between 2000 and 2100'),

  param('month')
    .isInt({ min: 1, max: 12 })
    .withMessage('Month must be between 1 and 12'),
];
