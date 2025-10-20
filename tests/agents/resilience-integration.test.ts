import { describe, it, expect, beforeEach } from 'vitest';
import { BaseAgent } from '../../src/agents/base-agent.js';
import { RateLimiter } from '../../src/utils/rate-limiter.js';
import type { AgentConfig, AgentInput } from '../../src/types/index.js';
import { AgentType } from '../../src/types/index.js';

/**
 * Integration Tests for Resilience Features
 * 
 * Tests the interaction between retry logic, rate limiting, and timeouts
 */

// Test agent with controllable behavior
class ResilienceTestAgent extends BaseAgent {
  private failureCount = 0;
  private targetFailures: number;
  private delayMs: number;

  constructor(
    config: AgentConfig,
    apiKey: string,
    options?: { failTimes?: number; delayMs?: number }
  ) {
    super(config, apiKey);
    this.targetFailures = options?.failTimes || 0;
    this.delayMs = options?.delayMs || 0;
  }

  protected async run(input: AgentInput): Promise<{
    data: unknown;
    tokensUsed?: number;
    confidence?: number;
    sources?: string[];
  }> {
    // Add delay if specified
    if (this.delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, this.delayMs));
    }

    // Fail N times then succeed
    if (this.failureCount < this.targetFailures) {
      this.failureCount++;
      throw new Error(`Transient failure ${this.failureCount}`);
    }

    return {
      data: { 
        success: true, 
        attemptNumber: this.failureCount + 1,
        brandName: input.context.brandName
      },
      tokensUsed: 100,
      confidence: 0.9,
      sources: ['test']
    };
  }

  // Expose formatPreviousOutputs for testing
  public testFormatPreviousOutputs(input: AgentInput): string {
    return this.formatPreviousOutputs(input);
  }
}

describe('Resilience Integration Tests', () => {
  const mockConfig: AgentConfig = {
    type: AgentType.COMPETITOR_RESEARCH,
    maxRetries: 2,
    timeout: 2000,
    model: 'claude-sonnet-4-5-20250929',
    temperature: 0.3
  };

  const mockInput: AgentInput = {
    context: {
      brandName: 'Test Brand',
      category: 'Test Category',
      competitors: [],
      dataSources: []
    }
  };

  describe('Exponential Backoff Timing', () => {
    it('should wait 0s before first attempt', async () => {
      // First attempt should be immediate
      const agent = new ResilienceTestAgent(mockConfig, 'test-key', { failTimes: 0 });
      
      const start = Date.now();
      const result = await agent.execute(mockInput);
      const duration = Date.now() - start;

      expect(result.status).toBe('completed');
      expect(duration).toBeLessThan(200); // Should be nearly immediate
    });

    it('should wait ~1s between 1st and 2nd attempt', async () => {
      const agent = new ResilienceTestAgent(mockConfig, 'test-key', { failTimes: 1 });
      
      const start = Date.now();
      const result = await agent.execute(mockInput);
      const duration = Date.now() - start;

      expect(result.status).toBe('completed');
      // Backoff for attempt 1: 2^0 * 1000 = 1s
      expect(duration).toBeGreaterThanOrEqual(1000);
      expect(duration).toBeLessThan(1500); // Allow 500ms margin
    });

    it('should wait ~1s then ~2s for 3 attempts', async () => {
      const agent = new ResilienceTestAgent(mockConfig, 'test-key', { failTimes: 2 });
      
      const start = Date.now();
      const result = await agent.execute(mockInput);
      const duration = Date.now() - start;

      expect(result.status).toBe('completed');
      // Backoff timing: attempt 0 fails, wait 2^0=1s, attempt 1 fails, wait 2^1=2s
      // Total wait: 1s + 2s = 3s (plus some execution overhead)
      expect(duration).toBeGreaterThanOrEqual(3000);
      expect(duration).toBeLessThan(3500); // Allow 500ms margin
    }, 10000);

    it('should fail after exhausting all retries', async () => {
      const agent = new ResilienceTestAgent(mockConfig, 'test-key', { failTimes: 10 });
      
      const start = Date.now();
      const result = await agent.execute(mockInput);
      const duration = Date.now() - start;

      expect(result.status).toBe('failed');
      expect(result.errors).toBeDefined();
      expect(result.errors?.[0]).toContain('Transient failure');
      
      // Should try 3 times (initial + 2 retries) then stop
      // Backoff: attempt 0 fails, wait 2^0=1s, attempt 1 fails, wait 2^1=2s, attempt 2 fails
      // Total wait: ~3s (allow 10ms tolerance for timing precision)
      expect(duration).toBeGreaterThanOrEqual(2990);
      expect(duration).toBeLessThan(3500);
    }, 10000);
  });

  describe('Rate Limiter Integration', () => {
    it('should handle parallel agents with rate limiting', async () => {
      const limiter = new RateLimiter({
        maxRequests: 3,
        windowMs: 1000
      });

      const testParallelExecution = async (agentId: number) => {
        await limiter.waitForSlot();
        return { id: agentId, timestamp: Date.now() };
      };

      // Launch 6 parallel "agents" (should batch into 2 groups of 3)
      const start = Date.now();
      const results = await Promise.all([
        testParallelExecution(1),
        testParallelExecution(2),
        testParallelExecution(3),
        testParallelExecution(4),
        testParallelExecution(5),
        testParallelExecution(6),
      ]);

      const duration = Date.now() - start;
      expect(results).toHaveLength(6);

      // First 3 should execute immediately
      const firstBatch = results.slice(0, 3);
      expect(firstBatch.every(r => r.timestamp - start < 200)).toBe(true);

      // Last 3 should wait ~1s for window to reset
      const secondBatch = results.slice(3, 6);
      expect(secondBatch.every(r => r.timestamp - start >= 1000)).toBe(true);

      // Total duration should be just over 1 second
      expect(duration).toBeGreaterThanOrEqual(1000);
      expect(duration).toBeLessThan(1500);
    }, 3000);

    it('should maintain rate limit under concurrent load', async () => {
      const limiter = new RateLimiter({
        maxRequests: 5,
        windowMs: 500
      });

      const timestamps: number[] = [];

      const makeRequest = async () => {
        await limiter.waitForSlot();
        timestamps.push(Date.now());
      };

      // Fire 12 concurrent requests
      await Promise.all(Array.from({ length: 12 }, () => makeRequest()));

      expect(timestamps).toHaveLength(12);

      // Check that no more than 5 requests happened in any 500ms window
      for (let i = 0; i < timestamps.length; i++) {
        const windowStart = timestamps[i];
        const windowEnd = windowStart + 500;
        const requestsInWindow = timestamps.filter(
          t => t >= windowStart && t <= windowEnd
        ).length;

        expect(requestsInWindow).toBeLessThanOrEqual(5);
      }
    }, 5000);
  });

  describe('Prompt Budget Management', () => {
    it('should not truncate small outputs', () => {
      const agent = new ResilienceTestAgent(mockConfig, 'test-key');
      
      const input: AgentInput = {
        context: mockInput.context,
        previousStageOutputs: {
          'stage1': { 
            data: 'Small output',
            metadata: { tokensUsed: 100 }
          }
        }
      };

      const formatted = agent.testFormatPreviousOutputs(input);
      
      expect(formatted).toContain('Small output');
      expect(formatted).not.toContain('[Truncated');
    });

    it('should truncate large stage outputs at 5000 chars', () => {
      const agent = new ResilienceTestAgent(mockConfig, 'test-key');
      
      // Create output larger than 5000 chars
      const largeData = 'x'.repeat(10000);
      
      const input: AgentInput = {
        context: mockInput.context,
        previousStageOutputs: {
          'stage1': { data: largeData }
        }
      };

      const formatted = agent.testFormatPreviousOutputs(input);
      
      expect(formatted).toContain('[Truncated');
      expect(formatted.length).toBeLessThan(6000); // Some overhead for formatting
    });

    it('should limit total output to 20000 chars', () => {
      const agent = new ResilienceTestAgent(mockConfig, 'test-key');
      
      // Create 6 stages with 4000 chars each = 24000 chars total
      const outputs: Record<string, unknown> = {};
      for (let i = 1; i <= 6; i++) {
        outputs[`stage${i}`] = { data: 'x'.repeat(4000) };
      }
      
      const input: AgentInput = {
        context: mockInput.context,
        previousStageOutputs: outputs
      };

      const formatted = agent.testFormatPreviousOutputs(input);
      
      // Should truncate to prevent exceeding 20k total
      expect(formatted).toContain('[Additional stages truncated');
      expect(formatted.length).toBeLessThan(25000); // Allow some overhead
    });

    it('should preserve stage order when truncating', () => {
      const agent = new ResilienceTestAgent(mockConfig, 'test-key');
      
      const input: AgentInput = {
        context: mockInput.context,
        previousStageOutputs: {
          'stage1': { data: 'First stage' },
          'stage2': { data: 'Second stage' },
          'stage3': { data: 'x'.repeat(30000) }  // Massive output
        }
      };

      const formatted = agent.testFormatPreviousOutputs(input);
      
      // Should have all stages (though stage3 truncated)
      expect(formatted).toContain('stage1');
      expect(formatted).toContain('stage2');
      expect(formatted).toContain('stage3');
      
      // Stage order should be preserved
      const stage1Pos = formatted.indexOf('stage1');
      const stage2Pos = formatted.indexOf('stage2');
      const stage3Pos = formatted.indexOf('stage3');
      
      expect(stage1Pos).toBeLessThan(stage2Pos);
      expect(stage2Pos).toBeLessThan(stage3Pos);
    });
  });

  describe('Combined Resilience Scenarios', () => {
    it('should retry with backoff when timeout occurs', async () => {
      const shortTimeoutConfig: AgentConfig = {
        ...mockConfig,
        timeout: 100 // Very short timeout
      };

      const agent = new ResilienceTestAgent(
        shortTimeoutConfig,
        'test-key',
        { delayMs: 200 } // Agent takes longer than timeout
      );

      const start = Date.now();
      const result = await agent.execute(mockInput);
      const duration = Date.now() - start;

      // Should timeout 3 times (initial + 2 retries)
      expect(result.status).toBe('failed');
      expect(result.errors?.[0]).toContain('timed out');

      // Total time: 100ms (timeout) + 1000ms (2^0 backoff) + 100ms (timeout) + 2000ms (2^1 backoff) + 100ms (timeout)
      // = ~3300ms
      expect(duration).toBeGreaterThanOrEqual(3200);
      expect(duration).toBeLessThan(3800);
    }, 10000);

    it('should succeed after transient failures with rate limiting', async () => {
      const limiter = new RateLimiter({
        maxRequests: 2,
        windowMs: 1000
      });

      class RateLimitedAgent extends ResilienceTestAgent {
        protected async run(input: AgentInput) {
          await limiter.waitForSlot();
          return super.run(input);
        }
      }

      const agent = new RateLimitedAgent(
        mockConfig,
        'test-key',
        { failTimes: 1 } // Fail once, succeed on retry
      );

      const result = await agent.execute(mockInput);

      expect(result.status).toBe('completed');
      expect(result.data).toEqual({
        success: true,
        attemptNumber: 2,
        brandName: 'Test Brand'
      });
    }, 5000);
  });
});

