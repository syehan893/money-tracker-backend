/**
 * API Request and Response types
 */

import type { Request } from 'express';
import type { User } from '@supabase/supabase-js';
import type { AccountType, BillingCycle } from './database.types';

/**
 * Extended Express Request with authenticated user
 */
export interface AuthenticatedRequest extends Request {
  user: User;
  accessToken: string;
}

/**
 * Standard API Success Response
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

/**
 * Standard API Error Response
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

/**
 * Union type for API responses
 */
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

/**
 * Date range filter
 */
export interface DateRangeFilter {
  startDate?: string;
  endDate?: string;
}

// ============================================
// AUTH DTOs
// ============================================

export interface RegisterDto {
  email: string;
  password: string;
  fullName?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    fullName: string | null;
    avatarUrl: string | null;
  };
  accessToken: string;
  refreshToken: string;
}

// ============================================
// ACCOUNT DTOs
// ============================================

export interface CreateAccountDto {
  name: string;
  accountType: AccountType;
  balance?: number;
}

export interface UpdateAccountDto {
  name?: string;
  isActive?: boolean;
}

export interface AccountFilters {
  type?: AccountType;
  isActive?: boolean;
}

export interface AccountSummary {
  totalBalance: number;
  accountsByType: {
    type: AccountType;
    count: number;
    totalBalance: number;
  }[];
}

// ============================================
// INCOME TYPE DTOs
// ============================================

export interface CreateIncomeTypeDto {
  name: string;
  description?: string;
  targetAmount?: number;
}

export interface UpdateIncomeTypeDto {
  name?: string;
  description?: string;
  targetAmount?: number;
  isActive?: boolean;
}

// ============================================
// INCOME DTOs
// ============================================

export interface CreateIncomeDto {
  accountId: string;
  incomeTypeId: string;
  amount: number;
  description?: string;
  date: string;
}

export interface UpdateIncomeDto {
  accountId?: string;
  incomeTypeId?: string;
  amount?: number;
  description?: string;
  date?: string;
}

export interface IncomeFilters extends DateRangeFilter, PaginationParams {
  accountId?: string;
  incomeTypeId?: string;
}

export interface MonthlySummary {
  year: number;
  month: number;
  totalAmount: number;
  byType: {
    typeId: string;
    typeName: string;
    amount: number;
    target?: number;
    percentage?: number;
  }[];
}

export interface TargetProgress {
  typeId: string;
  typeName: string;
  target: number;
  actual: number;
  percentage: number;
  remaining: number;
}

// ============================================
// EXPENSE TYPE DTOs
// ============================================

export interface CreateExpenseTypeDto {
  name: string;
  description?: string;
  budgetAmount?: number;
}

export interface UpdateExpenseTypeDto {
  name?: string;
  description?: string;
  budgetAmount?: number;
  isActive?: boolean;
}

// ============================================
// EXPENSE DTOs
// ============================================

export interface CreateExpenseDto {
  accountId: string;
  expenseTypeId: string;
  amount: number;
  description?: string;
  date: string;
}

export interface UpdateExpenseDto {
  accountId?: string;
  expenseTypeId?: string;
  amount?: number;
  description?: string;
  date?: string;
}

export interface ExpenseFilters extends DateRangeFilter, PaginationParams {
  accountId?: string;
  expenseTypeId?: string;
}

export interface BudgetStatus {
  typeId: string;
  typeName: string;
  budget: number;
  spent: number;
  remaining: number;
  percentage: number;
  isOverBudget: boolean;
}

// ============================================
// TRANSFER DTOs
// ============================================

export interface CreateTransferDto {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  description?: string;
  date: string;
}

export interface TransferFilters extends DateRangeFilter, PaginationParams {
  accountId?: string;
}

// ============================================
// SUBSCRIPTION DTOs
// ============================================

export interface CreateSubscriptionDto {
  accountId: string;
  name: string;
  amount: number;
  billingCycle: BillingCycle;
  nextBillingDate: string;
  description?: string;
}

export interface UpdateSubscriptionDto {
  accountId?: string;
  name?: string;
  amount?: number;
  billingCycle?: BillingCycle;
  nextBillingDate?: string;
  description?: string;
  isActive?: boolean;
}

export interface SubscriptionFilters extends PaginationParams {
  accountId?: string;
  isActive?: boolean;
  billingCycle?: BillingCycle;
}

// ============================================
// DASHBOARD DTOs
// ============================================

export interface DashboardOverview {
  totalBalance: number;
  accountsSummary: {
    type: AccountType;
    count: number;
    totalBalance: number;
  }[];
  currentMonthIncome: {
    total: number;
    target: number;
    percentage: number;
  };
  currentMonthExpenses: {
    total: number;
    budget: number;
    percentage: number;
  };
  netSavings: number;
  recentTransactions: RecentTransaction[];
}

export interface RecentTransaction {
  id: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  description: string | null;
  date: string;
  accountName: string;
  categoryName?: string;
}

export interface MonthlyDashboardSummary {
  year: number;
  month: number;
  income: {
    total: number;
    byType: {
      typeId: string;
      typeName: string;
      amount: number;
      target: number | null;
    }[];
  };
  expenses: {
    total: number;
    byType: {
      typeId: string;
      typeName: string;
      amount: number;
      budget: number | null;
    }[];
  };
  netSavings: number;
  transactionCounts: {
    incomes: number;
    expenses: number;
    transfers: number;
  };
}

export interface FinancialTrends {
  monthlyData: {
    yearMonth: string;
    income: number;
    expenses: number;
    savings: number;
  }[];
  categorySpending: {
    typeId: string;
    typeName: string;
    total: number;
    percentage: number;
  }[];
  incomeDistribution: {
    typeId: string;
    typeName: string;
    total: number;
    percentage: number;
  }[];
}
