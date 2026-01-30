/**
 * Subscription validation schemas
 */

import { body, param, query } from 'express-validator';
import { BILLING_CYCLE_VALUES } from '../config/constants';

/**
 * Validation for creating a subscription
 */
export const createSubscriptionValidator = [
  body('accountId')
    .notEmpty()
    .withMessage('Account ID is required')
    .isUUID()
    .withMessage('Invalid account ID format'),

  body('name')
    .trim()
    .notEmpty()
    .withMessage('Subscription name is required')
    .isLength({ min: 1, max: 255 })
    .withMessage('Subscription name must be between 1 and 255 characters'),

  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ gt: 0 })
    .withMessage('Amount must be a positive number'),

  body('billingCycle')
    .notEmpty()
    .withMessage('Billing cycle is required')
    .isIn(BILLING_CYCLE_VALUES)
    .withMessage(`Billing cycle must be one of: ${BILLING_CYCLE_VALUES.join(', ')}`),

  body('nextBillingDate')
    .notEmpty()
    .withMessage('Next billing date is required')
    .isISO8601()
    .withMessage('Next billing date must be in ISO format (YYYY-MM-DD)'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
];

/**
 * Validation for updating a subscription
 */
export const updateSubscriptionValidator = [
  param('id').isUUID().withMessage('Invalid subscription ID format'),

  body('accountId')
    .optional()
    .isUUID()
    .withMessage('Invalid account ID format'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Subscription name must be between 1 and 255 characters'),

  body('amount')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Amount must be a positive number'),

  body('billingCycle')
    .optional()
    .isIn(BILLING_CYCLE_VALUES)
    .withMessage(`Billing cycle must be one of: ${BILLING_CYCLE_VALUES.join(', ')}`),

  body('nextBillingDate')
    .optional()
    .isISO8601()
    .withMessage('Next billing date must be in ISO format (YYYY-MM-DD)'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),
];

/**
 * Validation for subscription ID parameter
 */
export const subscriptionIdValidator = [
  param('id').isUUID().withMessage('Invalid subscription ID format'),
];

/**
 * Validation for subscription list filters
 */
export const subscriptionFiltersValidator = [
  query('accountId')
    .optional()
    .isUUID()
    .withMessage('Invalid account ID format'),

  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),

  query('billingCycle')
    .optional()
    .isIn(BILLING_CYCLE_VALUES)
    .withMessage(`Billing cycle must be one of: ${BILLING_CYCLE_VALUES.join(', ')}`),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];
