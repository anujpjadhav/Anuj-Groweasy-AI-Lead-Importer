import { Request, Response, NextFunction } from "express";

/**
 * Global Express Error Handler Middleware.
 */
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error("[Server Error Handler] Captured exception:", err.message || err);

  const status = err.status || 500;
  const message = err.message || "An unexpected error occurred on the mapping server.";

  res.status(status).json({
    error: message,
    status
  });
}
