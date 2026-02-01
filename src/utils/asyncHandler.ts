import type { Request, Response, NextFunction } from 'express';

/**
 * Wraps an async handler to satisfy Express RequestHandler type (void return)
 * This is needed because Express 4 types expect void return, but async functions return Promise.
 * Note: Error handling is expected to be done within the controller or via a separate wrapper if needed.
 */
export const asyncHandler =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (fn: (req: any, res: Response, next: NextFunction) => Promise<void>) =>
    (req: Request, res: Response, next: NextFunction): void => {
      void fn(req, res, next);
    };
