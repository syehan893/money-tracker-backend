/**
 * Standardized API response utilities
 */

import type { Response } from 'express';
import { HTTP_STATUS } from '../config/constants';
import type { ApiSuccessResponse, ApiErrorResponse, PaginatedResponse } from '../types/api.types';

/**
 * Send a success response
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = HTTP_STATUS.OK
): Response<ApiSuccessResponse<T>> {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
  };

  if (message) {
    response.message = message;
  }

  return res.status(statusCode).json(response) as Response<ApiSuccessResponse<T>>;
}

/**
 * Send a created response (201)
 */
export function sendCreated<T>(
  res: Response,
  data: T,
  message?: string
): Response<ApiSuccessResponse<T>> {
  return sendSuccess(res, data, message, HTTP_STATUS.CREATED);
}

/**
 * Send a no content response (204)
 */
export function sendNoContent(res: Response): Response {
  return res.status(HTTP_STATUS.NO_CONTENT).send();
}

/**
 * Send an error response
 */
export function sendError(
  res: Response,
  code: string,
  message: string,
  statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  details?: Record<string, unknown>
): Response<ApiErrorResponse> {
  const response: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message,
    },
  };

  if (details) {
    response.error.details = details;
  }

  return res.status(statusCode).json(response) as Response<ApiErrorResponse>;
}

/**
 * Send a paginated response
 */
export function sendPaginated<T>(
  res: Response,
  items: T[],
  page: number,
  limit: number,
  total: number,
  message?: string
): Response<ApiSuccessResponse<PaginatedResponse<T>>> {
  const totalPages = Math.ceil(total / limit);
  const hasMore = page < totalPages;

  const paginatedData: PaginatedResponse<T> = {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore,
    },
  };

  return sendSuccess(res, paginatedData, message);
}
