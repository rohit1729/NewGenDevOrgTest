// Client-side logging helper with request ID support

export interface LogContext {
  requestId?: string;
  userId?: string;
  component?: string;
  action?: string;
  [key: string]: any;
}

export interface ErrorReport {
  message: string;
  stack?: string;
  requestId?: string;
  userId?: string;
  url: string;
  userAgent: string;
  timestamp: string;
  context?: LogContext;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  
  private formatMessage(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    const requestIdPart = context?.requestId ? ` [${context.requestId}]` : '';
    return `${prefix}${requestIdPart} ${message}`;
  }

  private log(level: 'log' | 'info' | 'warn' | 'error', message: string, context?: LogContext): void {
    const formattedMessage = this.formatMessage(level, message, context);
    
    if (this.isDevelopment) {
      console[level](formattedMessage, context || '');
    }
    
    // In production, you could send logs to a service like LogRocket, Sentry, etc.
    if (!this.isDevelopment && level === 'error') {
      this.sendErrorReport(message, context);
    }
  }

  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error, context?: LogContext): void {
    const errorContext: LogContext = {
      ...context,
      stack: error?.stack,
      errorName: error?.name,
    };
    
    this.log('error', message, errorContext);
  }

  apiError(
    path: string,
    status: number,
    error: string,
    requestId?: string,
    context?: LogContext
  ): void {
    this.error(`API Error: ${path}`, undefined, {
      ...context,
      requestId,
      status,
      apiError: error,
      type: 'api_error',
    });
  }

  apiSuccess(path: string, requestId?: string, context?: LogContext): void {
    this.info(`API Success: ${path}`, {
      ...context,
      requestId,
      type: 'api_success',
    });
  }

  userAction(action: string, requestId?: string, context?: LogContext): void {
    this.info(`User Action: ${action}`, {
      ...context,
      requestId,
      type: 'user_action',
    });
  }

  private sendErrorReport(message: string, context?: LogContext): void {
    try {
      const report: ErrorReport = {
        message,
        requestId: context?.requestId,
        userId: context?.userId,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        context,
        stack: context?.stack as string,
      };

      // Send to error reporting service
      // Example: Sentry, LogRocket, or your own error reporting endpoint
      console.warn('Error report ready to send:', report);
      
      // Uncomment and modify based on your error reporting service:
      // fetch('/api/error-reports', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(report),
      // }).catch(console.error);
    } catch (err) {
      console.error('Failed to send error report:', err);
    }
  }

  // Helper to extract request ID from API responses or errors
  extractRequestId(data: any): string | undefined {
    if (typeof data === 'object' && data !== null) {
      return data.requestId || data['x-request-id'];
    }
    return undefined;
  }

  // Helper to create context with request ID
  withRequestId(requestId: string, additionalContext?: LogContext): LogContext {
    return {
      requestId,
      ...additionalContext,
    };
  }
}

export const logger = new Logger();

// Helper functions for common use cases
export const logApiError = (
  path: string,
  status: number,
  error: string,
  requestId?: string
) => logger.apiError(path, status, error, requestId);

export const logApiSuccess = (path: string, requestId?: string) =>
  logger.apiSuccess(path, requestId);

export const logUserAction = (action: string, requestId?: string, context?: LogContext) =>
  logger.userAction(action, requestId, context);

export const logError = (message: string, error?: Error, context?: LogContext) =>
  logger.error(message, error, context);

export const logInfo = (message: string, context?: LogContext) =>
  logger.info(message, context);

export const logWarn = (message: string, context?: LogContext) =>
  logger.warn(message, context);
