// Example usage of the client-side logging with request IDs

import { apiRequest } from './api';
import { logError, logInfo, logUserAction, logger } from './logger';

// Example 1: Making an API request with automatic request ID logging
export async function loginUser(email: string, password: string) {
  try {
    logUserAction('login_attempt', undefined, { email });
    
    const user = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    logUserAction('login_success', undefined, { userId: user.id });
    return user;
  } catch (error) {
    logError('Login failed', error as Error, { email, action: 'login' });
    throw error;
  }
}

// Example 2: Custom error handling with request ID context
export async function handleApiError(error: any, context: { action: string; component: string }) {
  const requestId = logger.extractRequestId(error);
  
  logError(
    `${context.action} failed in ${context.component}`,
    error,
    logger.withRequestId(requestId || 'unknown', context)
  );
}

// Example 3: Component-level logging
export function useComponentLogger(componentName: string) {
  return {
    info: (message: string, requestId?: string, additionalContext?: any) =>
      logInfo(message, { component: componentName, requestId, ...additionalContext }),
    
    error: (message: string, error?: Error, requestId?: string, additionalContext?: any) =>
      logError(message, error, { component: componentName, requestId, ...additionalContext }),
    
    userAction: (action: string, requestId?: string, additionalContext?: any) =>
      logUserAction(action, requestId, { component: componentName, ...additionalContext }),
  };
}

// Example 4: React component usage
/*
import { useComponentLogger } from '@/lib/example-usage';

export function LoginForm() {
  const log = useComponentLogger('LoginForm');
  
  const handleSubmit = async (data: LoginForm) => {
    try {
      log.userAction('form_submit');
      const user = await loginUser(data.email, data.password);
      log.info('Login successful', undefined, { userId: user.id });
    } catch (error) {
      log.error('Login failed', error as Error);
    }
  };
  
  // ... rest of component
}
*/
