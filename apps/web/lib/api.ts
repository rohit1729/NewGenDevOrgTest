import { API_URL } from './env';
import { logApiError, logApiSuccess } from './logger';
import { ApiResponse } from './types';

// Generate a unique request ID for client-side requests
function generateRequestId(): string {
  return `web-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export async function fetchJSON<T = any>(path: string, init?: RequestInit): Promise<T> {
  const requestId = generateRequestId();
  
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'x-request-id': requestId,
      ...(init?.headers || {}),
    },
    cache: init?.cache,
    next: (init as any)?.next,
  });
  
  const responseRequestId = res.headers.get('x-request-id');
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    logApiError(path, res.status, errorData.error || `Request failed: ${res.status}`, responseRequestId || requestId);
    throw new Error(errorData.error || `Request failed: ${res.status}`);
  }
  
  const data = await res.json();
  logApiSuccess(path, responseRequestId || requestId);
  
  return data.success ? data.data : data;
}

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const requestId = generateRequestId();
  const headers = new Headers(init?.headers || {});
  const hasBody = init && 'body' in init && init.body != null;

  headers.set('x-request-id', requestId);

  if (
    hasBody &&
    !(init!.body instanceof FormData) &&
    !headers.has('Content-Type')
  ) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    credentials: 'include',
  });

  return response;
}

export async function apiRequest<T = any>(path: string, init?: RequestInit): Promise<T> {
  const res = await apiFetch(path, init);
  const responseRequestId = res.headers.get('x-request-id');
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    logApiError(path, res.status, errorData.error || `Request failed: ${res.status}`, responseRequestId);
    throw new Error(errorData.error || `Request failed: ${res.status}`);
  }
  
  const data: ApiResponse<T> = await res.json();
  
  if (!data.success) {
    logApiError(path, 200, data.error || 'Request failed', responseRequestId || data.requestId);
    throw new Error(data.error || 'Request failed');
  }
  
  logApiSuccess(path, responseRequestId || data.requestId);
  
  return data.data as T;
}

export const fetcher = (url: string) => {
  const requestId = generateRequestId();
  
  return fetch(url, { 
    credentials: 'include',
    headers: {
      'x-request-id': requestId
    }
  }).then(async (r) => {
    const responseRequestId = r.headers.get('x-request-id');
    
    if (!r.ok) {
      const errorData = await r.json().catch(() => ({}));
      logApiError(url, r.status, errorData.error || `Request failed: ${r.status}`, responseRequestId || requestId);
      throw new Error(errorData.error || `Request failed: ${r.status}`);
    }
    
    const data = await r.json();
    logApiSuccess(url, responseRequestId || requestId);
    
    return data;
  });
};