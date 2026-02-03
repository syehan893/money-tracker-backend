import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { env, isProduction } from './env';

/**
 * Initialize Sentry for error tracking and performance monitoring
 */
export function initSentry(): void {
  if (!env.SENTRY_DSN) {
    console.warn('Sentry DSN not found, skipping initialization');
    return;
  }

  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    integrations: [
      nodeProfilingIntegration(),
    ],
    // Performance Monitoring
    // Capture 100% of the transactions in dev/staging, 10% in prod
    tracesSampleRate: isProduction ? 0.1 : 1.0,
    
    // Set sampling rate for profiling - this is relative to tracesSampleRate
    profilesSampleRate: 1.0,

    // Release tracking
    release: process.env.COMMIT_HASH,

    // Sanitize sensitive data before sending
    beforeSend(event) {
      if (event.request && event.request.headers) {
        // Redact sensitive headers
        delete event.request.headers['authorization'];
        delete event.request.headers['cookie'];
      }
      return event;
    },
  });
  
  console.info('Sentry initialized successfully');
}
