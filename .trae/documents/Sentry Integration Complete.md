I have successfully integrated Sentry into the backend project.

### **Completed Tasks**

1.  **Dependencies**: Installed `@sentry/node` and `@sentry/profiling-node`.
2.  **Configuration**:
    *   Created `src/config/sentry.ts` with DSN, environment, sampling rates (100% dev, 10% prod), profiling, and `beforeSend` data sanitization (redacting Authorization and Cookie headers).
    *   Updated `.env` and `.env.example` to include `SENTRY_DSN`.
3.  **Express Integration**:
    *   Updated `src/app.ts` to initialize Sentry on startup.
    *   Added `Sentry.setupExpressErrorHandler(app)` to capture unhandled errors automatically.
    *   Added a test route `/api/debug-sentry` to verify error reporting.
4.  **User Context**:
    *   Modified `src/middleware/auth.middleware.ts` to attach the authenticated user's ID and email to the Sentry scope, allowing you to track which user experienced an error.
5.  **Logging Utility**:
    *   Updated `src/utils/logger.util.ts` to automatically send error logs to Sentry when `logger.error()` or `logger.logError()` is called, ensuring consistent reporting.
6.  **Source Maps & Releases**:
    *   Added a `sentry:sourcemaps` script to `package.json` for uploading source maps during deployment.
    *   Configured Sentry to track releases via `COMMIT_HASH` environment variable.

### **Verification**

*   **Build**: The project builds successfully (`npm run build`).
*   **Testing**: You can test the integration by starting the server and visiting `http://localhost:3000/api/debug-sentry`. This will throw an error that should appear in your Sentry dashboard.

### **Next Steps**

*   **Frontend**: If you need Sentry integration for the frontend (React/Vite), please provide the path to that codebase.
*   **Deployment**: Ensure `SENTRY_DSN` is set in your production environment variables. For source map uploads, you will need to set `SENTRY_AUTH_TOKEN` and `SENTRY_ORG`/`SENTRY_PROJECT` in your CI/CD pipeline or `.env` and run `npm run sentry:sourcemaps`.