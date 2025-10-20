import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BaseAgent } from '../../src/agents/base-agent.js';
import { AgentType, AgentConfig } from '../../src/types/index.js';
import type { AgentInput } from '../../src/types/index.js';

// Mock concrete implementation for testing
class TestAgent extends BaseAgent {
  constructor(config: AgentConfig, apiKey: string) {
    super(config, apiKey);
  }

  protected async run(input: AgentInput): Promise<{
    data: unknown;
    tokensUsed?: number;
    confidence?: number;
    sources?: string[];
  }> {
    // Simulate some work
    await new Promise(resolve => setTimeout(resolve, 100));
    return {
      data: { test: 'data', brand: input.context.brandName },
      tokensUsed: 100,
      confidence: 0.9,
      sources: ['test_source']
    };
  }
}

describe('BaseAgent', () => {
  let agent: TestAgent;
  const mockApiKey = 'test-api-key';
  const validInput: AgentInput = {
    context: {
      brandName: 'Test Brand',
      category: 'Test Category',
      competitors: [],
      dataSources: []
    }
  };

  beforeEach(() => {
    const config: AgentConfig = {
      type: AgentType.COMPETITOR_RESEARCH,
      maxRetries: 2,
      timeout: 5000,
      model: 'claude-sonnet-4-5-20250929',
      temperature: 0.3
    };
    agent = new TestAgent(config, mockApiKey);
  });

  describe('execute', () => {
    it('should successfully execute and return completed status', async () => {
      const result = await agent.execute(validInput);

      expect(result.status).toBe('completed');
      expect(result.agentType).toBe(AgentType.COMPETITOR_RESEARCH);
      expect(result.data).toBeDefined();
      expect(result.metadata.tokensUsed).toBe(100);
      expect(result.metadata.confidence).toBe(0.9);
    });

    it('should track execution duration', async () => {
      const result = await agent.execute(validInput);

      expect(result.metadata.durationMs).toBeGreaterThan(0);
      expect(result.metadata.durationMs).toBeGreaterThanOrEqual(100); // At least 100ms
    });

    it('should handle errors and return failed status', async () => {
      // Create an agent that throws an error
      class FailingAgent extends BaseAgent {
        protected async run(): Promise<{ data: unknown }> {
          throw new Error('Test error');
        }
      }

      const failingAgent = new FailingAgent(agent.config, mockApiKey);
      const result = await failingAgent.execute(validInput);

      expect(result.status).toBe('failed');
      expect(result.data).toBeNull();
      expect(result.errors).toBeDefined();
      expect(result.errors?.[0]).toContain('Test error');
    });
  });

  describe('validateInput', () => {
    it('should throw error if input is missing', () => {
      expect(() => agent['validateInput'](null as any)).toThrow('Agent input is required');
    });

    it('should throw error if context is missing', () => {
      expect(() => agent['validateInput']({} as any)).toThrow('Brand context is required');
    });

    it('should throw error if brand name is missing', () => {
      expect(() => agent['validateInput']({
        context: { category: 'Test' }
      } as any)).toThrow('Brand name is required');
    });

    it('should throw error if category is missing', () => {
      expect(() => agent['validateInput']({
        context: { brandName: 'Test' }
      } as any)).toThrow('Brand category is required');
    });

    it('should not throw for valid input', () => {
      expect(() => agent['validateInput'](validInput)).not.toThrow();
    });
  });

  describe('timeout handling', () => {
    it('should timeout if execution takes too long', async () => {
      // Create agent with very short timeout
      const config: AgentConfig = {
        type: AgentType.COMPETITOR_RESEARCH,
        maxRetries: 0,
        timeout: 50, // 50ms timeout
        model: 'claude-sonnet-4-5-20250929',
        temperature: 0.3
      };

      class SlowAgent extends BaseAgent {
        protected async run(): Promise<{ data: unknown }> {
          await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
          return { data: 'should not reach' };
        }
      }

      const slowAgent = new SlowAgent(config, mockApiKey);
      const result = await slowAgent.execute(validInput);

      expect(result.status).toBe('failed');
      expect(result.errors?.[0]).toContain('timed out');
    });

    it('should clear timer when execution completes normally', async () => {
      // This test verifies no memory leak occurs
      const result = await agent.execute(validInput);
      
      expect(result.status).toBe('completed');
      expect(agent['activeTimer']).toBeNull();
    });
  });

  describe('retry logic', () => {
    it('should retry on failure', async () => {
      let attempts = 0;

      class RetryAgent extends BaseAgent {
        protected async run(): Promise<{ data: unknown }> {
          attempts++;
          if (attempts < 2) {
            throw new Error('Temporary error');
          }
          return { data: 'success', tokensUsed: 50 };
        }
      }

      const config: AgentConfig = {
        ...agent.config,
        maxRetries: 2
      };

      const retryAgent = new RetryAgent(config, mockApiKey);
      const result = await retryAgent.execute(validInput);

      expect(attempts).toBe(2); // Initial attempt + 1 retry
      expect(result.status).toBe('completed');
    });

    it('should fail after max retries exhausted', async () => {
      class AlwaysFailsAgent extends BaseAgent {
        protected async run(): Promise<{ data: unknown }> {
          throw new Error('Persistent error');
        }
      }

      const config: AgentConfig = {
        ...agent.config,
        maxRetries: 1
      };

      const failingAgent = new AlwaysFailsAgent(config, mockApiKey);
      const result = await failingAgent.execute(validInput);

      expect(result.status).toBe('failed');
      expect(result.errors?.[0]).toBe('Persistent error');
    });
  });
});
