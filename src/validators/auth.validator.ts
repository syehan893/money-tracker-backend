/**
 * Auth validation schemas
 */

import { body } from 'express-validator';

/**
 * Validation for user registration
 */
export const registerValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/\d/)
    .withMessage('Password must contain at least one number'),

  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Full name must be between 2 and 255 characters'),
];

/**
 * Validation for user login
 */
export const loginValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password').notEmpty().withMessage('Password is required'),
];

/**
 * Validation for forgot password request
 */
export const forgotPasswordValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
];

/**
 * Validation for password reset
 */
export const resetPasswordValidator = [
  body('token').notEmpty().withMessage('Reset token is required'),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/\d/)
    .withMessage('Password must contain at least one number'),
];

/**
 * Validation for profile update
 */
export const updateProfileValidator = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Full name must be between 2 and 255 characters'),

  body('avatarUrl').optional().trim().isURL().withMessage('Please provide a valid URL for avatar'),
];
