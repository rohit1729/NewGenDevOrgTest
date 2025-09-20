import { NextFunction, Request, Response } from 'express';
import { HttpError } from '../utils/errors';
import { logger } from '../utils/logger';
import { sendError } from '../utils/response';

export function notFound(_req: Request, res: Response) {
  sendError(res, 'Not found', 'NOT_FOUND', 404);
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const requestId = res.getHeader('x-request-id') as string;
  
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    name: err.name,
    requestId,
  });

  if (err instanceof HttpError) {
    return res.status(err.status).json(err.toJSONWithRequestId(requestId));
  }

  if (err.name === 'ValidationError') {
    return sendError(res, 'Validation failed', 'VALIDATION_ERROR', 400);
  }

  if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    return sendError(res, 'Resource already exists', 'DUPLICATE_KEY', 409);
  }

  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 'Invalid token', 'INVALID_TOKEN', 401);
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, 'Token expired', 'TOKEN_EXPIRED', 401);
  }

  const errorMessage = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;
  
  sendError(res, errorMessage, 'INTERNAL_ERROR', 500);
}