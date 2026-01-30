/**
 * Common validation helper utilities
 */

import { validate as uuidValidate } from 'uuid';

/**
 * Validate UUID format
 */
export function isValidUUID(value: string): boolean {
  return uuidValidate(value);
}

/**
 * Validate date string in ISO format (YYYY-MM-DD)
 */
export function isValidDateString(value: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(value)) {
    return false;
  }

  const date = new Date(value);
  return !isNaN(date.getTime());
}

/**
 * Validate that a value is a positive number
 */
export function isPositiveNumber(value: number): boolean {
  return typeof value === 'number' && !isNaN(value) && value > 0;
}

/**
 * Validate that a value is a non-negative number
 */
export function isNonNegativeNumber(value: number): boolean {
  return typeof value === 'number' && !isNaN(value) && value >= 0;
}

/**
 * Validate email format
 */
export function isValidEmail(value: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

/**
 * Validate password strength
 * - At least 8 characters
 * - Contains at least one uppercase letter
 * - Contains at least one lowercase letter
 * - Contains at least one number
 */
export function isStrongPassword(value: string): boolean {
  if (value.length < 8) {
    return false;
  }

  const hasUppercase = /[A-Z]/.test(value);
  const hasLowercase = /[a-z]/.test(value);
  const hasNumber = /\d/.test(value);

  return hasUppercase && hasLowercase && hasNumber;
}

/**
 * Sanitize a string by trimming whitespace and removing control characters
 */
export function sanitizeString(value: string): string {
  // eslint-disable-next-line no-control-regex
  return value.trim().replace(/[\x00-\x1F\x7F]/g, '');
}

/**
 * Parse page and limit from query parameters with defaults
 */
export function parsePaginationParams(
  page?: string | number,
  limit?: string | number,
  maxLimit: number = 100,
  defaultLimit: number = 20
): { page: number; limit: number; offset: number } {
  const parsedPage = Math.max(1, parseInt(String(page), 10) || 1);
  const parsedLimit = Math.min(
    maxLimit,
    Math.max(1, parseInt(String(limit), 10) || defaultLimit)
  );
  const offset = (parsedPage - 1) * parsedLimit;

  return {
    page: parsedPage,
    limit: parsedLimit,
    offset,
  };
}

/**
 * Parse date range from query parameters
 */
export function parseDateRange(
  startDate?: string,
  endDate?: string
): { startDate: string | null; endDate: string | null } {
  return {
    startDate: startDate && isValidDateString(startDate) ? startDate : null,
    endDate: endDate && isValidDateString(endDate) ? endDate : null,
  };
}

/**
 * Get first and last day of a month
 */
export function getMonthDateRange(
  year: number,
  month: number
): { startDate: string; endDate: string } {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0); // Last day of month

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  };
}

/**
 * Get date range for last N months
 */
export function getLastMonthsDateRange(months: number): { startDate: string; endDate: string } {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  };
}
