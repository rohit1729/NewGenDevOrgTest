import { Response } from 'express';

export interface ApiResponseData<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string;
  requestId?: string;
}

export function sendResponse<T>(res: Response, data: Omit<ApiResponseData<T>, 'requestId'>, statusCode = 200) {
  const requestId = res.getHeader('x-request-id') as string;
  
  return res.status(statusCode).json({
    ...data,
    requestId
  });
}

export function sendSuccess<T>(res: Response, data?: T, message?: string, statusCode = 200) {
  return sendResponse(res, {
    success: true,
    data,
    message
  }, statusCode);
}

export function sendError(res: Response, error: string, code?: string, statusCode = 500) {
  return sendResponse(res, {
    success: false,
    error,
    code
  }, statusCode);
}
