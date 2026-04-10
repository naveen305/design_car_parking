import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';

/**
 * Global Express error-handling middleware.
 * Must be registered LAST in the middleware chain (after all routes).
 *
 * Handles:
 *  - AppError (operational errors) → uses statusCode from the error
 *  - Unknown errors                → 500 Internal Server Error
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        statusCode: err.statusCode,
      },
    });
    return;
  }

  // Unhandled / programming errors — don't leak internals
  console.error('[Unhandled Error]', err);
  res.status(500).json({
    success: false,
    error: {
      message: 'An unexpected internal error occurred',
      statusCode: 500,
    },
  });
}
