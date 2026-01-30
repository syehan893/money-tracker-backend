/**
 * Centralized error handling middleware
 */

import type { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS, ERROR_CODES } from '../config/constants';
import { isDevelopment } from '../config/env';

/**
 * Custom application error class
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: Record<string, unknown>;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    code: string = ERROR_CODES.INTERNAL_ERROR,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;

    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Not Found Error
 */
export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource', id?: string) {
    const message = id ? `${resource} with id '${id}' not found` : `${resource} not found`;
    super(message, HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
  }
}

/**
 * Validation Error
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR, details);
  }
}

/**
 * Unauthorized Error
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED);
  }
}

/**
 * Forbidden Error
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, HTTP_STATUS.FORBIDDEN, ERROR_CODES.UNAUTHORIZED);
  }
}

/**
 * Conflict Error
 */
export class ConflictError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, HTTP_STATUS.CONFLICT, ERROR_CODES.CONFLICT, details);
  }
}

/**
 * Insufficient Balance Error
 */
export class InsufficientBalanceError extends AppError {
  constructor(accountId: string, required: number, available: number) {
    super(
      `Insufficient balance in account. Required: ${required}, Available: ${available}`,
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.INSUFFICIENT_BALANCE,
      { accountId, required, available }
    );
  }
}

/**
 * Database Error
 */
export class DatabaseError extends AppError {
  constructor(message: string, originalError?: unknown) {
    super(message, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_CODES.DATABASE_ERROR, {
      originalError: isDevelopment ? String(originalError) : undefined,
    });
  }
}

/**
 * Parse Supabase errors and convert to AppError
 */
export function parseSupabaseError(error: {
  code?: string;
  message: string;
  details?: string;
}): AppError {
  const { code, message, details } = error;

  // Handle specific Supabase error codes
  switch (code) {
    case '23505': // Unique violation
      return new ConflictError('A record with this value already exists', { details });

    case '23503': // Foreign key violation
      return new ValidationError('Referenced record does not exist', {
        code: ERROR_CODES.FOREIGN_KEY_VIOLATION,
        details,
      });

    case '23514': // Check constraint violation
      return new ValidationError('Data validation failed', {
        code: ERROR_CODES.CONSTRAINT_VIOLATION,
        details,
      });

    case '42501': // Insufficient privilege (RLS)
      return new ForbiddenError('You do not have permission to perform this action');

    case 'PGRST116': // No rows returned
      return new NotFoundError();

    default:
      return new DatabaseError(message || 'Database operation failed');
  }
}

/**
 * Global error handling middleware
 */
export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log error for debugging
  console.error('Error:', {
    name: err.name,
    message: err.message,
    stack: isDevelopment ? err.stack : undefined,
  });

  // Handle AppError instances
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: isDevelopment ? err.details : undefined,
      },
    });
    return;
  }

  // Handle validation errors from express-validator
  if (err.name === 'ValidationError') {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: {
        code: ERROR_CODES.VALIDATION_ERROR,
        message: err.message,
      },
    });
    return;
  }

  // Handle unknown errors
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    error: {
      code: ERROR_CODES.INTERNAL_ERROR,
      message: isDevelopment ? err.message : 'An unexpected error occurred',
      details: isDevelopment ? { stack: err.stack } : undefined,
    },
  });
}

/**
 * 404 Not Found handler for unmatched routes
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    error: {
      code: ERROR_CODES.NOT_FOUND,
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
}
