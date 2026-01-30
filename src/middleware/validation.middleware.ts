/**
 * Validation middleware
 * Handles express-validator validation results
 */

import type { Request, Response, NextFunction } from 'express';
import { validationResult, type ValidationChain } from 'express-validator';
import { HTTP_STATUS, ERROR_CODES } from '../config/constants';

/**
 * Middleware to handle validation errors from express-validator
 * Use this after validation chains in routes
 */
export function handleValidationErrors(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error) => ({
      field: 'path' in error ? error.path : 'unknown',
      message: error.msg as string,
      value: 'value' in error ? error.value : undefined,
    }));

    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: {
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'Validation failed',
        details: {
          errors: formattedErrors,
        },
      },
    });
    return;
  }

  next();
}

/**
 * Factory function to create validation middleware
 * Combines validation chains with error handling
 */
export function validate(validations: ValidationChain[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Run all validations
    await Promise.all(validations.map((validation) => validation.run(req)));

    // Check for errors
    handleValidationErrors(req, res, next);
  };
}
