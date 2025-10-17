/**
 * Rate Limiter for API Calls
 *
 * Prevents hitting API rate limits by tracking and limiting requests
 */

export interface RateLimitConfig {
  readonly maxRequests: number;
  readonly windowMs: number;
}

export class RateLimiter {
  private requests: number[] = [];

  constructor(private readonly config: RateLimitConfig) {
    // Validate configuration
    if (config.maxRequests <= 0) {
      throw new Error('maxRequests must be positive');
    }
    if (config.windowMs <= 0) {
      throw new Error('windowMs must be positive');
    }
  }

  /**
   * Check if request is allowed under rate limit
   */
  async canMakeRequest(): Promise<boolean> {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    // Remove old requests outside the window
    this.requests = this.requests.filter(time => time > windowStart);

    return this.requests.length < this.config.maxRequests;
  }

  /**
   * Record a request (with automatic pruning)
   */
  recordRequest(): void {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    // Prune old entries before adding new one
    this.requests = this.requests.filter(time => time > windowStart);
    this.requests.push(now);
  }

  /**
   * Wait until a request slot is available (atomic check+record)
   */
  async waitForSlot(): Promise<void> {
    while (true) {
      const now = Date.now();
      const windowStart = now - this.config.windowMs;

      // Atomic operation: prune, check, and record in single tick
      this.requests = this.requests.filter(time => time > windowStart);

      if (this.requests.length < this.config.maxRequests) {
        // Slot available - record immediately (no async gap)
        this.requests.push(now);
        return;
      }

      // No slot available - wait before retrying
      const waitTime = this.getWaitTime();
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  /**
   * Calculate wait time until next available slot
   */
  private getWaitTime(): number {
    if (this.requests.length === 0) return 0;

    const oldestRequest = Math.min(...this.requests);
    const windowStart = Date.now() - this.config.windowMs;

    return Math.max(0, oldestRequest - windowStart + 100);
  }

  /**
   * Get current rate limit status
   */
  getStatus(): {
    requestsInWindow: number;
    slotsAvailable: number;
    utilizationPercent: number;
  } {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    this.requests = this.requests.filter(time => time > windowStart);

    const requestCount = this.requests.length;
    const utilization = (requestCount / this.config.maxRequests) * 100;

    return {
      requestsInWindow: requestCount,
      slotsAvailable: Math.max(0, this.config.maxRequests - requestCount),
      utilizationPercent: Math.min(100, Math.max(0, utilization))
    };
  }
}

// Global rate limiter for Claude API
export const claudeRateLimiter = new RateLimiter({
  maxRequests: 50,
  windowMs: 60000 // 50 requests per minute
});
