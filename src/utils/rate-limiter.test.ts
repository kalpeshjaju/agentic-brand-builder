import { describe, it, expect, beforeEach } from 'vitest';
import { RateLimiter } from './rate-limiter.js';

describe('RateLimiter', () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    limiter = new RateLimiter({
      maxRequests: 3,
      windowMs: 1000
    });
  });

  describe('constructor', () => {
    it('should throw error for non-positive maxRequests', () => {
      expect(() => new RateLimiter({ maxRequests: 0, windowMs: 1000 }))
        .toThrow('maxRequests must be positive');

      expect(() => new RateLimiter({ maxRequests: -1, windowMs: 1000 }))
        .toThrow('maxRequests must be positive');
    });

    it('should throw error for non-positive windowMs', () => {
      expect(() => new RateLimiter({ maxRequests: 10, windowMs: 0 }))
        .toThrow('windowMs must be positive');

      expect(() => new RateLimiter({ maxRequests: 10, windowMs: -1 }))
        .toThrow('windowMs must be positive');
    });

    it('should accept valid configuration', () => {
      expect(() => new RateLimiter({ maxRequests: 10, windowMs: 1000 }))
        .not.toThrow();
    });
  });

  describe('canMakeRequest', () => {
    it('should allow requests under the limit', async () => {
      expect(await limiter.canMakeRequest()).toBe(true);
      limiter.recordRequest();

      expect(await limiter.canMakeRequest()).toBe(true);
      limiter.recordRequest();

      expect(await limiter.canMakeRequest()).toBe(true);
    });

    it('should block requests over the limit', async () => {
      // Fill up the rate limit
      limiter.recordRequest();
      limiter.recordRequest();
      limiter.recordRequest();

      expect(await limiter.canMakeRequest()).toBe(false);
    });

    it('should allow requests after window expires', async () => {
      // Fill up the rate limit
      limiter.recordRequest();
      limiter.recordRequest();
      limiter.recordRequest();

      expect(await limiter.canMakeRequest()).toBe(false);

      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 1100));

      expect(await limiter.canMakeRequest()).toBe(true);
    });
  });

  describe('getStatus', () => {
    it('should return correct status when empty', () => {
      const status = limiter.getStatus();

      expect(status.requestsInWindow).toBe(0);
      expect(status.slotsAvailable).toBe(3);
      expect(status.utilizationPercent).toBe(0);
    });

    it('should return correct status when partially filled', () => {
      limiter.recordRequest();
      limiter.recordRequest();

      const status = limiter.getStatus();

      expect(status.requestsInWindow).toBe(2);
      expect(status.slotsAvailable).toBe(1);
      expect(status.utilizationPercent).toBeCloseTo(66.67, 1);
    });

    it('should return correct status when full', () => {
      limiter.recordRequest();
      limiter.recordRequest();
      limiter.recordRequest();

      const status = limiter.getStatus();

      expect(status.requestsInWindow).toBe(3);
      expect(status.slotsAvailable).toBe(0);
      expect(status.utilizationPercent).toBe(100);
    });

    it('should clean up expired requests', async () => {
      limiter.recordRequest();

      await new Promise(resolve => setTimeout(resolve, 1100));

      const status = limiter.getStatus();
      expect(status.requestsInWindow).toBe(0);
    });
  });

  describe('waitForSlot', () => {
    it('should not wait when slots are available', async () => {
      const start = Date.now();
      await limiter.waitForSlot();
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100);
    });

    it('should wait and record request when slot becomes available', async () => {
      // Fill rate limit
      limiter.recordRequest();
      limiter.recordRequest();
      limiter.recordRequest();

      const waitPromise = limiter.waitForSlot();

      // Wait should complete after window expires
      await waitPromise;

      const status = limiter.getStatus();
      expect(status.requestsInWindow).toBeGreaterThan(0);
    }, 2000);
  });
});
