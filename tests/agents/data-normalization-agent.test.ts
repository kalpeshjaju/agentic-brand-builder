import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DataNormalizationAgent } from '../../src/agents/stage1/data-normalization-agent.js';
import type { AgentConfig, AgentInput } from '../../src/types/index.js';
import { AgentType } from '../../src/types/index.js';

// Mock Anthropic SDK
vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: {
      create: vi.fn().mockResolvedValue({
        content: [{
          type: 'text',
          text: JSON.stringify({
            normalized: {
              brandName: 'Test Brand',
              category: 'Test Category',
              financials: {
                currentRevenue: {
                  original: '₹35 Cr',
                  normalized: 350000000,
                  currency: 'INR',
                  displayFormat: '₹35 Crore'
                }
              }
            },
            qualityIssues: [],
            transformations: {
              totalFields: 3,
              normalized: 3,
              issues: 0
            },
            confidence: 0.9
          })
        }],
        usage: {
          input_tokens: 100,
          output_tokens: 200
        }
      })
    }
  }))
}));

describe('DataNormalizationAgent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  const mockConfig: AgentConfig = {
    type: AgentType.DATA_NORMALIZATION,
    maxRetries: 2,
    timeout: 60000,
    model: 'claude-sonnet-4-5-20250929',
    temperature: 0.3
  };

  describe('execute', () => {
    it('should normalize basic brand context', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Test Category',
          currentRevenue: '₹35 Cr',
          targetRevenue: '₹100 Cr',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new DataNormalizationAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.data).toBeDefined();
    });

    it('should return normalized data structure', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Test Category',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new DataNormalizationAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.data).toHaveProperty('normalized');
    });

    it('should have high confidence for simple normalization', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Test Category',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new DataNormalizationAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.metadata.confidence).toBeGreaterThan(0.5);
    });

    it('should process previous stage outputs', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Test Category',
          competitors: [],
          dataSources: []
        },
        previousStageOutputs: {
          pdf_extraction: {
            documents: [
              {
                financials: { revenue: '₹35 Cr' }
              }
            ]
          }
        }
      };

      const agent = new DataNormalizationAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.data).toBeDefined();
    });

    it('should include sources in metadata', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Test Category',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new DataNormalizationAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.metadata.sources).toContain('data_normalization');
    });
  });
});
