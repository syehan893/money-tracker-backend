/**
 * Expense and Expense Type validation schemas
 */

import { body, param, query } from 'express-validator';

// ============================================
// EXPENSE TYPE VALIDATORS
// ============================================

/**
 * Validation for creating an expense type
 */
export const createExpenseTypeValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Expense type name is required')
    .isLength({ min: 1, max: 255 })
    .withMessage('Expense type name must be between 1 and 255 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),

  body('budgetAmount')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Budget amount must be a positive number'),
];

/**
 * Validation for updating an expense type
 */
export const updateExpenseTypeValidator = [
  param('id').isUUID().withMessage('Invalid expense type ID format'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Expense type name must be between 1 and 255 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),

  body('budgetAmount')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Budget amount must be a positive number'),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),
];

/**
 * Validation for expense type ID parameter
 */
export const expenseTypeIdValidator = [
  param('id').isUUID().withMessage('Invalid expense type ID format'),
];

// ============================================
// EXPENSE VALIDATORS
// ============================================

/**
 * Validation for creating an expense
 */
export const createExpenseValidator = [
  body('accountId')
    .notEmpty()
    .withMessage('Account ID is required')
    .isUUID()
    .withMessage('Invalid account ID format'),

  body('expenseTypeId')
    .notEmpty()
    .withMessage('Expense type ID is required')
    .isUUID()
    .withMessage('Invalid expense type ID format'),

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
 * Validation for updating an expense
 */
export const updateExpenseValidator = [
  param('id').isUUID().withMessage('Invalid expense ID format'),

  body('accountId')
    .optional()
    .isUUID()
    .withMessage('Invalid account ID format'),

  body('expenseTypeId')
    .optional()
    .isUUID()
    .withMessage('Invalid expense type ID format'),

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
 * Validation for expense ID parameter
 */
export const expenseIdValidator = [
  param('id').isUUID().withMessage('Invalid expense ID format'),
];

/**
 * Validation for expense list filters
 */
export const expenseFiltersValidator = [
  query('accountId')
    .optional()
    .isUUID()
    .withMessage('Invalid account ID format'),

  query('expenseTypeId')
    .optional()
    .isUUID()
    .withMessage('Invalid expense type ID format'),

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
 * Validation for monthly expense summary parameters
 */
export const expenseMonthlySummaryValidator = [
  param('year')
    .isInt({ min: 2000, max: 2100 })
    .withMessage('Year must be between 2000 and 2100'),

  param('month')
    .isInt({ min: 1, max: 12 })
    .withMessage('Month must be between 1 and 12'),
];
