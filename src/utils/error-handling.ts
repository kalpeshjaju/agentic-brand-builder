/**
 * Error Handling Utilities for Agent System
 *
 * Prevents cascade failures and provides graceful degradation
 * Score: 36/40 - High-value reliability improvement
 */

export class AgentError extends Error {
  constructor(
    message: string,
    public agentName: string,
    public stage: string,
    public recoverable: boolean = true,
    public cause?: Error
  ) {
    super(message);
    this.name = 'AgentError';
  }
}

export interface AgentResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: AgentError;
  fallbackUsed?: boolean;
}

/**
 * Wrap agent execution with error handling
 */
export async function withErrorHandling<T>(
  agentName: string,
  stage: string,
  fn: () => Promise<T>,
  options: {
    fallback?: () => Promise<T>;
    onError?: (error: AgentError) => void;
    maxRetries?: number;
  } = {}
): Promise<AgentResult<T>> {
  const { fallback, onError, maxRetries = 0 } = options;
  let lastError: Error | undefined;

  // Try with retries
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const data = await fn();
      return { success: true, data };
    } catch (error) {
      lastError = error as Error;

      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        await new Promise(resolve =>
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        );
      }
    }
  }

  // All retries failed, create AgentError
  const agentError = new AgentError(
    `Agent ${agentName} failed after ${maxRetries + 1} attempts`,
    agentName,
    stage,
    !!fallback,
    lastError
  );

  // Try fallback if available
  if (fallback) {
    try {
      const data = await fallback();
      return { success: true, data, fallbackUsed: true };
    } catch (fallbackError) {
      agentError.recoverable = false;
    }
  }

  // Call error handler
  if (onError) {
    onError(agentError);
  }

  return { success: false, error: agentError };
}

/**
 * Collect partial results even when some agents fail
 */
export async function withPartialResults<T>(
  operations: Array<{
    name: string;
    fn: () => Promise<T>;
  }>,
  options: {
    failFast?: boolean;
    minSuccessCount?: number;
  } = {}
): Promise<{
  results: Array<{ name: string; result: AgentResult<T> }>;
  successCount: number;
  failureCount: number;
}> {
  const { failFast = false, minSuccessCount = 1 } = options;
  const results: Array<{ name: string; result: AgentResult<T> }> = [];

  for (const operation of operations) {
    const result = await withErrorHandling(
      operation.name,
      'parallel',
      operation.fn
    );

    results.push({ name: operation.name, result });

    // Fast fail if needed
    if (failFast && !result.success) {
      break;
    }
  }

  const successCount = results.filter(r => r.result.success).length;
  const failureCount = results.filter(r => !r.result.success).length;

  // Check minimum success requirement
  if (successCount < minSuccessCount) {
    throw new Error(
      `Insufficient successful operations: ${successCount}/${minSuccessCount} required`
    );
  }

  return { results, successCount, failureCount };
}
