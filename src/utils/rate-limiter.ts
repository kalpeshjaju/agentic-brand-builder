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
   * Record a request
   */
  recordRequest(): void {
    this.requests.push(Date.now());
  }

  /**
   * Wait until a request slot is available
   */
  async waitForSlot(): Promise<void> {
    while (!(await this.canMakeRequest())) {
      const waitTime = this.getWaitTime();
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.recordRequest();
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

    return {
      requestsInWindow: this.requests.length,
      slotsAvailable: this.config.maxRequests - this.requests.length,
      utilizationPercent: (this.requests.length / this.config.maxRequests) * 100
    };
  }
}

// Global rate limiter for Claude API
export const claudeRateLimiter = new RateLimiter({
  maxRequests: 50,
  windowMs: 60000 // 50 requests per minute
});
