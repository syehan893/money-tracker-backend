/**
 * Application logging utility
 * Provides structured logging with different levels
 */

import * as Sentry from '@sentry/node';
import { env, isProduction } from '../config/env';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: Record<string, unknown>;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Get current log level from environment
 */
function getCurrentLogLevel(): number {
  const level = env.LOG_LEVEL.toLowerCase() as LogLevel;
  return LOG_LEVELS[level] ?? LOG_LEVELS.info;
}

/**
 * Check if a log level should be logged
 */
function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= getCurrentLogLevel();
}

/**
 * Format log entry for output
 */
function formatLogEntry(entry: LogEntry): string {
  if (isProduction) {
    // JSON format for production (easier to parse by log aggregators)
    return JSON.stringify(entry);
  }

  // Human-readable format for development
  const { timestamp, level, message, context, data } = entry;
  let output = `[${timestamp}] ${level.toUpperCase()}`;

  if (context) {
    output += ` [${context}]`;
  }

  output += `: ${message}`;

  if (data && Object.keys(data).length > 0) {
    output += `\n  ${JSON.stringify(data, null, 2)}`;
  }

  return output;
}

/**
 * Create a log entry and output it
 */
function log(
  level: LogLevel,
  message: string,
  context?: string,
  data?: Record<string, unknown>
): void {
  if (!shouldLog(level)) {
    return;
  }

  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    context,
    data,
  };

  const formatted = formatLogEntry(entry);

  switch (level) {
    case 'debug':
    case 'info':
      // Using console.info for info level to avoid linter warnings
      // eslint-disable-next-line no-console
      console.info(formatted);
      break;
    case 'warn':
      console.warn(formatted);
      break;
    case 'error':
      console.error(formatted);
      break;
  }
}

/**
 * Logger object with methods for each log level
 */
export const logger = {
  /**
   * Log debug message (development only)
   */
  debug(message: string, context?: string, data?: Record<string, unknown>): void {
    log('debug', message, context, data);
  },

  /**
   * Log info message
   */
  info(message: string, context?: string, data?: Record<string, unknown>): void {
    log('info', message, context, data);
  },

  /**
   * Log warning message
   */
  warn(message: string, context?: string, data?: Record<string, unknown>): void {
    log('warn', message, context, data);
  },

  /**
   * Log error message
   */
  error(message: string, context?: string, data?: Record<string, unknown>): void {
    Sentry.captureMessage(message, {
      level: 'error',
      extra: { context, ...data },
    });
    log('error', message, context, data);
  },

  /**
   * Log an error object with stack trace
   */
  logError(error: Error, context?: string): void {
    Sentry.captureException(error, {
      extra: { context },
    });
    log('error', error.message, context, {
      name: error.name,
      stack: error.stack,
    });
  },
};

/**
 * Create a child logger with preset context
 */
export function createLogger(context: string): {
  debug: (message: string, data?: Record<string, unknown>) => void;
  info: (message: string, data?: Record<string, unknown>) => void;
  warn: (message: string, data?: Record<string, unknown>) => void;
  error: (message: string, data?: Record<string, unknown>) => void;
  logError: (error: Error) => void;
} {
  return {
    debug(message: string, data?: Record<string, unknown>): void {
      logger.debug(message, context, data);
    },
    info(message: string, data?: Record<string, unknown>): void {
      logger.info(message, context, data);
    },
    warn(message: string, data?: Record<string, unknown>): void {
      logger.warn(message, context, data);
    },
    error(message: string, data?: Record<string, unknown>): void {
      logger.error(message, context, data);
    },
    logError(error: Error): void {
      logger.logError(error, context);
    },
  };
}
