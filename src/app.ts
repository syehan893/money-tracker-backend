/**
 * Express application setup
 */

import express, { type Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import * as Sentry from '@sentry/node';

import { env } from './config/env';
import { initSentry } from './config/sentry';
import { RATE_LIMITS, HTTP_STATUS } from './config/constants';
import { swaggerSpec } from './config/swagger';
import swaggerUi from 'swagger-ui-express';
import { httpLogger, errorHandler, notFoundHandler } from './middleware';
import {
  authRoutes,
  accountRoutes,
  incomeTypeRoutes,
  incomeRoutes,
  expenseTypeRoutes,
  expenseRoutes,
  transferRoutes,
  subscriptionRoutes,
  dashboardRoutes,
} from './routes';

/**
 * Create and configure Express application
 */
export function createApp(): Application {
  // Initialize Sentry
  initSentry();

  const app = express();

  // Trust proxy - required for rate limiting behind reverse proxy
  app.set('trust proxy', 1);

  // Security middleware
  app.use(helmet());

  // CORS configuration
  app.use(
    cors({
      origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(','),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Compression middleware
  app.use(compression());

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // HTTP request logging
  app.use(httpLogger);

  // General rate limiting
  const generalLimiter = rateLimit({
    windowMs: RATE_LIMITS.GENERAL.WINDOW_MS,
    max: RATE_LIMITS.GENERAL.MAX_REQUESTS,
    message: {
      success: false,
      error: {
        code: 'TOO_MANY_REQUESTS',
        message: 'Too many requests, please try again later',
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(generalLimiter);

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: env.NODE_ENV,
      },
    });
  });

  // Optional: Debug Sentry route
  app.get('/api/debug-sentry', (_req, _res) => {
    throw new Error('Sentry Debug Error');
  });

  // Swagger Documentation
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // API Routes
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/accounts', accountRoutes);
  app.use('/api/v1/income-types', incomeTypeRoutes);
  app.use('/api/v1/incomes', incomeRoutes);
  app.use('/api/v1/expense-types', expenseTypeRoutes);
  app.use('/api/v1/expenses', expenseRoutes);
  app.use('/api/v1/transfers', transferRoutes);
  app.use('/api/v1/subscriptions', subscriptionRoutes);
  app.use('/api/v1/dashboard', dashboardRoutes);

  // The Sentry ErrorHandler must be before any other error middleware and after all controllers
  Sentry.setupExpressErrorHandler(app);

  // 404 handler for unmatched routes
  app.use(notFoundHandler);

  // Global error handler
  app.use(errorHandler);

  return app;
}
