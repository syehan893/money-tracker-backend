/**
 * Central export for all routes
 */

export { default as authRoutes } from './auth.routes';
export { default as accountRoutes } from './account.routes';
export {
  incomeTypeRouter as incomeTypeRoutes,
  incomeRouter as incomeRoutes,
} from './income.routes';
export {
  expenseTypeRouter as expenseTypeRoutes,
  expenseRouter as expenseRoutes,
} from './expense.routes';
export { default as transferRoutes } from './transfer.routes';
export { default as subscriptionRoutes } from './subscription.routes';
export { default as dashboardRoutes } from './dashboard.routes';
