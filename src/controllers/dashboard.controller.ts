/**
 * Dashboard Controller
 * Handles HTTP requests for dashboard and analytics endpoints
 */

import type { Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboard.service';
import { sendSuccess } from '../utils/response.util';
import type { AuthenticatedRequest } from '../types/api.types';

export class DashboardController {
  /**
   * GET /api/v1/dashboard/overview
   * Get complete financial overview
   */
  async getOverview(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user, accessToken } = req;

      const overview = await dashboardService.getOverview(user.id, accessToken);

      sendSuccess(res, overview);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/dashboard/monthly-summary/:year/:month
   * Get monthly breakdown summary
   */
  async getMonthlySummary(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { user, accessToken } = req;
      const { year, month } = req.params;

      const summary = await dashboardService.getMonthlySummary(
        user.id,
        parseInt(year, 10),
        parseInt(month, 10),
        accessToken
      );

      sendSuccess(res, summary);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/dashboard/trends
   * Get financial trends
   */
  async getTrends(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user, accessToken } = req;

      const trends = await dashboardService.getTrends(user.id, accessToken);

      sendSuccess(res, trends);
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();
