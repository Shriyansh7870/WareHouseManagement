import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error(`[${new Date().toISOString()}] Error:`, err.message);
  console.error(err.stack);

  if (res.headersSent) return next(err);

  const statusCode = (err as any).statusCode ?? 500;
  return res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? 'Internal server error' : err.message,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
}
