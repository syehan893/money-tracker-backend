/**
 * Dashboard Service
 * Handles business logic for dashboard and analytics
 */

import { accountRepository } from '../repositories/account.repository';
import { incomeRepository } from '../repositories/income.repository';
import { expenseRepository } from '../repositories/expense.repository';
import { transferRepository } from '../repositories/transfer.repository';
import { subscriptionRepository } from '../repositories/subscription.repository';
import type {
  DashboardOverview,
  MonthlyDashboardSummary,
  FinancialTrends,
  RecentTransaction,
} from '../types/api.types';
import { DASHBOARD } from '../config/constants';

export class DashboardService {
  /**
   * Get complete financial overview for dashboard
   */
  async getOverview(userId: string, accessToken: string): Promise<DashboardOverview> {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    // Fetch data in parallel
    const [accountsSummary, incomeData, expenseData, recentTransactions] = await Promise.all([
      accountRepository.getSummary(userId, accessToken),
      this.getCurrentMonthIncome(userId, year, month, accessToken),
      this.getCurrentMonthExpenses(userId, year, month, accessToken),
      this.getRecentTransactions(userId, accessToken),
    ]);

    const netSavings = incomeData.total - expenseData.total;

    return {
      totalBalance: accountsSummary.totalBalance,
      accountsSummary: accountsSummary.accountsByType,
      currentMonthIncome: incomeData,
      currentMonthExpenses: expenseData,
      netSavings,
      recentTransactions,
    };
  }

  /**
   * Get monthly breakdown summary
   */
  async getMonthlySummary(
    userId: string,
    year: number,
    month: number,
    accessToken: string
  ): Promise<MonthlyDashboardSummary> {
    // Fetch income and expense data
    const [incomeSummary, expenseSummary] = await Promise.all([
      incomeRepository.getMonthlySummary(userId, year, month, accessToken),
      expenseRepository.getMonthlySummary(userId, year, month, accessToken),
    ]);

    // Count transactions
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    const [incomeResult, expenseResult, transferResult] = await Promise.all([
      incomeRepository.findAll(userId, accessToken, { startDate, endDate }, 0, 1),
      expenseRepository.findAll(userId, accessToken, { startDate, endDate }, 0, 1),
      transferRepository.findAll(userId, accessToken, { startDate, endDate }, 0, 1),
    ]);

    return {
      year,
      month,
      income: {
        total: incomeSummary.totalAmount,
        byType: incomeSummary.byType,
      },
      expenses: {
        total: expenseSummary.totalAmount,
        byType: expenseSummary.byType,
      },
      netSavings: incomeSummary.totalAmount - expenseSummary.totalAmount,
      transactionCounts: {
        incomes: incomeResult.total,
        expenses: expenseResult.total,
        transfers: transferResult.total,
      },
    };
  }

  /**
   * Get financial trends for last N months
   */
  async getTrends(userId: string, accessToken: string): Promise<FinancialTrends> {
    const now = new Date();
    const monthlyData: FinancialTrends['monthlyData'] = [];

    // Get data for last 6 months
    for (let i = DASHBOARD.TRENDS_MONTHS - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      const [incomeSummary, expenseSummary] = await Promise.all([
        incomeRepository.getMonthlySummary(userId, year, month, accessToken),
        expenseRepository.getMonthlySummary(userId, year, month, accessToken),
      ]);

      monthlyData.push({
        yearMonth: `${year}-${String(month).padStart(2, '0')}`,
        income: incomeSummary.totalAmount,
        expenses: expenseSummary.totalAmount,
        savings: incomeSummary.totalAmount - expenseSummary.totalAmount,
      });
    }

    // Get current month spending by category
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const [expenseSummary, incomeSummary] = await Promise.all([
      expenseRepository.getMonthlySummary(userId, currentYear, currentMonth, accessToken),
      incomeRepository.getMonthlySummary(userId, currentYear, currentMonth, accessToken),
    ]);

    // Calculate category spending percentages
    const totalExpenses = expenseSummary.totalAmount;
    const categorySpending = expenseSummary.byType.map((item) => ({
      typeId: item.typeId,
      typeName: item.typeName,
      total: item.amount,
      percentage: totalExpenses > 0 ? Math.round((item.amount / totalExpenses) * 10000) / 100 : 0,
    }));

    // Calculate income distribution percentages
    const totalIncome = incomeSummary.totalAmount;
    const incomeDistribution = incomeSummary.byType.map((item) => ({
      typeId: item.typeId,
      typeName: item.typeName,
      total: item.amount,
      percentage: totalIncome > 0 ? Math.round((item.amount / totalIncome) * 10000) / 100 : 0,
    }));

    return {
      monthlyData,
      categorySpending,
      incomeDistribution,
    };
  }

  /**
   * Get current month income with target
   */
  private async getCurrentMonthIncome(
    userId: string,
    year: number,
    month: number,
    accessToken: string
  ): Promise<{ total: number; target: number; percentage: number }> {
    const summary = await incomeRepository.getMonthlySummary(userId, year, month, accessToken);

    // Sum all targets
    let totalTarget = 0;
    for (const item of summary.byType) {
      if (item.target) {
        totalTarget += item.target;
      }
    }

    const percentage = totalTarget > 0 ? Math.round((summary.totalAmount / totalTarget) * 10000) / 100 : 0;

    return {
      total: summary.totalAmount,
      target: totalTarget,
      percentage,
    };
  }

  /**
   * Get current month expenses with budget
   */
  private async getCurrentMonthExpenses(
    userId: string,
    year: number,
    month: number,
    accessToken: string
  ): Promise<{ total: number; budget: number; percentage: number }> {
    const summary = await expenseRepository.getMonthlySummary(userId, year, month, accessToken);

    // Sum all budgets
    let totalBudget = 0;
    for (const item of summary.byType) {
      if (item.budget) {
        totalBudget += item.budget;
      }
    }

    const percentage = totalBudget > 0 ? Math.round((summary.totalAmount / totalBudget) * 10000) / 100 : 0;

    return {
      total: summary.totalAmount,
      budget: totalBudget,
      percentage,
    };
  }

  /**
   * Get recent transactions across all types
   */
  private async getRecentTransactions(
    userId: string,
    accessToken: string
  ): Promise<RecentTransaction[]> {
    const limit = DASHBOARD.RECENT_TRANSACTIONS_LIMIT;

    // Fetch recent incomes, expenses, and transfers
    const [incomeResult, expenseResult, transferResult] = await Promise.all([
      incomeRepository.findAll(userId, accessToken, {}, 0, limit),
      expenseRepository.findAll(userId, accessToken, {}, 0, limit),
      transferRepository.findAll(userId, accessToken, {}, 0, limit),
    ]);

    const transactions: RecentTransaction[] = [];

    // Add incomes
    for (const income of incomeResult.incomes) {
      transactions.push({
        id: income.id,
        type: 'income',
        amount: Number(income.amount),
        description: income.description,
        date: income.date,
        accountName: income.account?.name || 'Unknown',
        categoryName: income.income_type?.name,
      });
    }

    // Add expenses
    for (const expense of expenseResult.expenses) {
      transactions.push({
        id: expense.id,
        type: 'expense',
        amount: Number(expense.amount),
        description: expense.description,
        date: expense.date,
        accountName: expense.account?.name || 'Unknown',
        categoryName: expense.expense_type?.name,
      });
    }

    // Add transfers
    for (const transfer of transferResult.transfers) {
      transactions.push({
        id: transfer.id,
        type: 'transfer',
        amount: Number(transfer.amount),
        description: transfer.description,
        date: transfer.date,
        accountName: `${transfer.from_account?.name || 'Unknown'} → ${transfer.to_account?.name || 'Unknown'}`,
      });
    }

    // Sort by date descending and take top N
    transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return transactions.slice(0, limit);
  }
}

export const dashboardService = new DashboardService();
