// Application constants

/**
 * Account type enumeration
 */
export const ACCOUNT_TYPES = {
  SAVING: 'saving',
  SPENDING: 'spending',
  WALLET: 'wallet',
  INVESTMENT: 'investment',
  BUSINESS: 'business',
} as const;

export type AccountType = (typeof ACCOUNT_TYPES)[keyof typeof ACCOUNT_TYPES];

export const ACCOUNT_TYPE_VALUES = Object.values(ACCOUNT_TYPES);

/**
 * Billing cycle enumeration for subscriptions
 */
export const BILLING_CYCLES = {
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  YEARLY: 'yearly',
} as const;

export type BillingCycle = (typeof BILLING_CYCLES)[keyof typeof BILLING_CYCLES];

export const BILLING_CYCLE_VALUES = Object.values(BILLING_CYCLES);

/**
 * HTTP Status codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * Error codes for API responses
 */
export const ERROR_CODES = {
  // Authentication errors
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  UNAUTHORIZED: 'UNAUTHORIZED',

  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  INVALID_UUID: 'INVALID_UUID',
  INVALID_DATE_FORMAT: 'INVALID_DATE_FORMAT',
  INVALID_ENUM_VALUE: 'INVALID_ENUM_VALUE',

  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',

  // Business logic errors
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  SAME_ACCOUNT_TRANSFER: 'SAME_ACCOUNT_TRANSFER',
  ACCOUNT_INACTIVE: 'ACCOUNT_INACTIVE',
  INVALID_AMOUNT: 'INVALID_AMOUNT',

  // Database errors
  DATABASE_ERROR: 'DATABASE_ERROR',
  CONSTRAINT_VIOLATION: 'CONSTRAINT_VIOLATION',
  FOREIGN_KEY_VIOLATION: 'FOREIGN_KEY_VIOLATION',

  // Server errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

/**
 * Pagination defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

/**
 * Date format constants
 */
export const DATE_FORMATS = {
  ISO_DATE: 'YYYY-MM-DD',
  ISO_DATETIME: 'YYYY-MM-DDTHH:mm:ss.sssZ',
} as const;

/**
 * API versioning
 */
export const API_VERSION = 'v1';
export const API_PREFIX = `/api/${API_VERSION}`;

/**
 * Rate limiting configurations
 */
export const RATE_LIMITS = {
  AUTH: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 10, // 10 requests per window
  },
  GENERAL: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100, // 100 requests per window
  },
} as const;

/**
 * Dashboard constants
 */
export const DASHBOARD = {
  RECENT_TRANSACTIONS_LIMIT: 10,
  TRENDS_MONTHS: 6,
} as const;
