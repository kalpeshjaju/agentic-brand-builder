import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BaseAgent } from '../../src/agents/base-agent.js';
import type { AgentConfig, AgentInput } from '../../src/types/index.js';
import { AgentType } from '../../src/types/index.js';

// Mock implementation of BaseAgent for testing
class TestAgent extends BaseAgent {
  private shouldFail: boolean;
  private shouldTimeout: boolean;

  constructor(config: AgentConfig, apiKey: string, options?: { shouldFail?: boolean; shouldTimeout?: boolean }) {
    super(config, apiKey);
    this.shouldFail = options?.shouldFail || false;
    this.shouldTimeout = options?.shouldTimeout || false;
  }

  protected async run(input: AgentInput): Promise<{
    data: unknown;
    tokensUsed?: number;
    confidence?: number;
    sources?: string[];
  }> {
    if (this.shouldTimeout) {
      // Simulate timeout
      await new Promise(resolve => setTimeout(resolve, 10000));
    }

    if (this.shouldFail) {
      throw new Error('Test agent failure');
    }

    // Small delay to ensure measurable duration
    await new Promise(resolve => setTimeout(resolve, 10));

    return {
      data: { test: 'success', brandName: input.context.brandName },
      tokensUsed: 100,
      confidence: 0.9,
      sources: ['test']
    };
  }
}

describe('BaseAgent', () => {
  const mockConfig: AgentConfig = {
    type: AgentType.COMPETITOR_RESEARCH,
    maxRetries: 2,
    timeout: 1000, // 1 second for tests
    model: 'claude-sonnet-4-5-20250929',
    temperature: 0.3
  };

  const mockInput: AgentInput = {
    context: {
      brandName: 'Test Brand',
      category: 'Test Category',
      competitors: ['Competitor 1'],
      dataSources: []
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('execute', () => {
    it('should execute successfully and return completed status', async () => {
      const agent = new TestAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(mockInput);

      expect(result.status).toBe('completed');
      expect(result.agentType).toBe(AgentType.COMPETITOR_RESEARCH);
      expect(result.data).toEqual({ test: 'success', brandName: 'Test Brand' });
      expect(result.metadata.tokensUsed).toBe(100);
      expect(result.metadata.confidence).toBe(0.9);
      expect(result.metadata.sources).toEqual(['test']);
      expect(result.metadata.durationMs).toBeGreaterThan(0);
    });

    it('should retry on failure', async () => {
      let attemptCount = 0;
      class RetryTestAgent extends BaseAgent {
        protected async run(): Promise<{ data: unknown }> {
          attemptCount++;
          if (attemptCount <= 2) {
            throw new Error('Temporary failure');
          }
          return { data: { success: true } };
        }
      }

      const agent = new RetryTestAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(mockInput);

      expect(attemptCount).toBe(3); // Initial + 2 retries
      expect(result.status).toBe('completed');
    });

    it('should return failed status after all retries exhausted', async () => {
      const agent = new TestAgent(mockConfig, 'test-api-key', { shouldFail: true });
      const result = await agent.execute(mockInput);

      expect(result.status).toBe('failed');
      expect(result.errors).toBeDefined();
      expect(result.errors?.[0]).toContain('Test agent failure');
    });

    it('should handle timeout', async () => {
      const agent = new TestAgent(mockConfig, 'test-api-key', { shouldTimeout: true });
      const result = await agent.execute(mockInput);

      expect(result.status).toBe('failed');
      expect(result.errors?.[0]).toContain('timed out');
    }, 15000);
  });

  describe('formatBrandContext', () => {
    it('should format brand context correctly', async () => {
      class FormatTestAgent extends BaseAgent {
        public testFormatBrandContext(input: AgentInput): string {
          return this.formatBrandContext(input);
        }

        protected async run(): Promise<{ data: unknown }> {
          return { data: {} };
        }
      }

      const agent = new FormatTestAgent(mockConfig, 'test-api-key');
      const formatted = agent.testFormatBrandContext(mockInput);

      expect(formatted).toContain('Test Brand');
      expect(formatted).toContain('Test Category');
      expect(formatted).toContain('Competitor 1');
    });
  });
});
