import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SegmentationAgent } from '../../src/agents/stage2/segmentation-agent.js';
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
            segments: [
              {
                id: 'segment-1',
                name: 'Budget-Conscious Millennials',
                priority: 1,
                persona: {
                  demographics: {
                    ageRange: '25-35',
                    gender: 'All genders',
                    income: '₹3-6 lakhs/year'
                  },
                  psychographics: {
                    values: ['Value for money', 'Quality'],
                    lifestyle: 'Digital-first'
                  },
                  behaviors: {
                    purchaseFrequency: 'Monthly',
                    channelPreference: 'Online'
                  },
                  needsAndPainPoints: ['Affordable quality']
                },
                marketMetrics: {
                  size: '15-20 million',
                  accessibility: 'high'
                }
              }
            ],
            segmentationInsights: {
              primarySegment: 'segment-1',
              totalAddressableMarket: '50-60 million'
            },
            confidence: 0.85
          })
        }],
        usage: {
          input_tokens: 200,
          output_tokens: 400
        }
      })
    }
  }))
}));

describe('SegmentationAgent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockConfig: AgentConfig = {
    type: AgentType.SEGMENTATION,
    maxRetries: 2,
    timeout: 60000,
    model: 'claude-sonnet-4-5-20250929',
    temperature: 0.3
  };

  describe('execute', () => {
    it('should identify customer segments', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new SegmentationAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.data).toBeDefined();
    });

    it('should return segments array', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new SegmentationAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.data).toHaveProperty('segments');
      const data = result.data as { segments: unknown[] };
      expect(Array.isArray(data.segments)).toBe(true);
      expect(data.segments.length).toBeGreaterThan(0);
    });

    it('should include segment personas', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new SegmentationAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      const data = result.data as { segments: Array<{ persona: unknown }> };
      expect(data.segments[0]).toHaveProperty('persona');
    });

    it('should include segmentation insights', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new SegmentationAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.data).toHaveProperty('segmentationInsights');
    });

    it('should process previous stage outputs', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        },
        previousStageOutputs: {
          data_normalization: {
            normalized: {
              financials: {
                currentRevenue: { normalized: 35000000 }
              }
            }
          }
        }
      };

      const agent = new SegmentationAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.data).toBeDefined();
    });

    it('should have high confidence', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new SegmentationAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.metadata.confidence).toBeGreaterThan(0.7);
    });

    it('should include sources in metadata', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new SegmentationAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.metadata.sources).toContain('segmentation_analysis');
    });
  });
});
