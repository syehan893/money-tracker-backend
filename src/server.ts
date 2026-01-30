/**
 * Server entry point
 * Starts the Express application
 */

import { createApp } from './app';
import { env } from './config/env';
import { testDatabaseConnection } from './config/database';
import { logger } from './utils/logger.util';

const app = createApp();

/**
 * Start the server
 */
async function startServer(): Promise<void> {
  try {
    // Test database connection
    logger.info('Testing database connection...', 'Server');
    const dbConnected = await testDatabaseConnection();

    if (!dbConnected) {
      logger.warn(
        'Database connection test failed. Server will start but database operations may fail.',
        'Server'
      );
    } else {
      logger.info('Database connection successful', 'Server');
    }

    // Start listening
    const server = app.listen(env.PORT, env.HOST, () => {
      logger.info(`Server started successfully`, 'Server', {
        host: env.HOST,
        port: env.PORT,
        environment: env.NODE_ENV,
        nodeVersion: process.version,
      });

      logger.info(`API available at http://${env.HOST}:${env.PORT}/api`, 'Server');
      logger.info(`Health check at http://${env.HOST}:${env.PORT}/api/health`, 'Server');
    });

    // Graceful shutdown handlers
    const gracefulShutdown = (signal: string): void => {
      logger.info(`${signal} received. Starting graceful shutdown...`, 'Server');

      server.close(() => {
        logger.info('HTTP server closed', 'Server');
        process.exit(0);
      });

      // Force shutdown after 30 seconds
      setTimeout(() => {
        logger.error('Forced shutdown due to timeout', 'Server');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught Exception', 'Server', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: unknown) => {
      logger.error('Unhandled Rejection', 'Server', {
        reason: String(reason),
      });
      process.exit(1);
    });
  } catch (error) {
    logger.error('Failed to start server', 'Server', {
      error: error instanceof Error ? error.message : String(error),
    });
    process.exit(1);
  }
}

// Start the server
startServer();
