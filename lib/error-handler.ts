type ErrorLevel = 'info' | 'warning' | 'error' | 'fatal';

interface AppError {
  message: string;
  code?: string;
  level: ErrorLevel;
  context?: Record<string, unknown>;
  timestamp: number;
  stack?: string;
}

type ErrorHandler = (error: AppError) => void;

const handlers: ErrorHandler[] = [];
const errorLog: AppError[] = [];
const MAX_LOG_SIZE = 100;

export function registerErrorHandler(handler: ErrorHandler): () => void {
  handlers.push(handler);
  return () => {
    const idx = handlers.indexOf(handler);
    if (idx !== -1) handlers.splice(idx, 1);
  };
}

export function captureError(
  error: Error | string,
  level: ErrorLevel = 'error',
  context?: Record<string, unknown>,
): AppError {
  const appError: AppError = {
    message: typeof error === 'string' ? error : error.message,
    level,
    context,
    timestamp: Date.now(),
    stack: typeof error === 'string' ? undefined : error.stack,
  };

  errorLog.push(appError);
  if (errorLog.length > MAX_LOG_SIZE) errorLog.shift();

  for (const handler of handlers) {
    try {
      handler(appError);
    } catch { /* handler error */ }
  }

  return appError;
}

export function getErrorLog(): ReadonlyArray<AppError> {
  return errorLog;
}

export function clearErrorLog(): void {
  errorLog.length = 0;
}

export function setupGlobalErrorHandlers(): () => void {
  const handleError = (event: ErrorEvent) => {
    captureError(event.error || event.message, 'error', { type: 'uncaught' });
  };

  const handleRejection = (event: PromiseRejectionEvent) => {
    const msg = event.reason instanceof Error ? event.reason : String(event.reason);
    captureError(typeof msg === 'string' ? msg : msg, 'error', { type: 'unhandled-rejection' });
  };

  window.addEventListener('error', handleError);
  window.addEventListener('unhandledrejection', handleRejection);

  return () => {
    window.removeEventListener('error', handleError);
    window.removeEventListener('unhandledrejection', handleRejection);
  };
}
