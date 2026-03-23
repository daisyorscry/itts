// Generic API response types based on backend spec

export interface ApiMeta {
  requestId: string;
  timestamp: string;
}

export interface ApiResponse<T> {
  data: T;
  meta: ApiMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiErrorResponse {
  error: ApiError;
  meta: ApiMeta;
}

// Helper to extract error message
export function getErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null) {
    const err = error as { response?: { data?: ApiErrorResponse } };
    
    if (err.response?.data?.error?.message) {
      return err.response.data.error.message;
    }
  }
  
  return 'An unexpected error occurred';
}
