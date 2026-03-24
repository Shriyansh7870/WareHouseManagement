import { Response } from 'express';

export function success<T>(res: Response, data: T, meta?: object, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
    ...(meta ? { meta } : {}),
  });
}

export function error(res: Response, message: string, statusCode = 400, details?: unknown) {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(details ? { details } : {}),
  });
}
