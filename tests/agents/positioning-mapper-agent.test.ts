import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PositioningMapperAgent } from '../../src/agents/stage2/positioning-mapper-agent.js';
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
            positioningDimensions: [
              { dimension: 'Price', lowLabel: 'Value', highLabel: 'Premium', importance: 0.9 },
              { dimension: 'Quality', lowLabel: 'Basic', highLabel: 'Superior', importance: 0.85 }
            ],
            brandPositions: [
              {
                brandId: 'target-brand',
                brandName: 'Test Brand',
                isTarget: true,
                position: { price: 5, quality: 7 },
                clarityScore: 0.7
              },
              {
                brandId: 'competitor-1',
                brandName: 'Competitor A',
                isTarget: false,
                position: { price: 8, quality: 9 }
              }
            ],
            clusters: [
              {
                clusterId: 'premium',
                clusterName: 'Premium Cluster',
                brands: ['competitor-1'],
                size: '30%'
              }
            ],
            whiteSpaces: [
              {
                spaceId: 'affordable-premium',
                spaceName: 'Affordable Premium',
                attractiveness: 8
              }
            ],
            strategicRecommendations: {
              recommendedPosition: {
                target: { price: 6, quality: 8 },
                positioning: 'Affordable Premium'
              },
              keyMoves: ['Optimize pricing'],
              risks: ['Market perception']
            },
            confidence: 0.80
          })
        }],
        usage: {
          input_tokens: 400,
          output_tokens: 800
        }
      })
    }
  }))
}));

describe('PositioningMapperAgent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockConfig: AgentConfig = {
    type: AgentType.POSITIONING_MAPPER,
    maxRetries: 2,
    timeout: 60000,
    model: 'claude-sonnet-4-5-20250929',
    temperature: 0.3
  };

  describe('execute', () => {
    it('should create positioning map', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: ['Competitor A'],
          dataSources: []
        }
      };

      const agent = new PositioningMapperAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.data).toBeDefined();
    });

    it('should include positioning dimensions', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new PositioningMapperAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.data).toHaveProperty('positioningDimensions');
    });

    it('should include brand positions', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new PositioningMapperAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.data).toHaveProperty('brandPositions');
    });

    it('should identify clusters', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new PositioningMapperAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.data).toHaveProperty('clusters');
    });

    it('should identify white spaces', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new PositioningMapperAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.data).toHaveProperty('whiteSpaces');
    });

    it('should include strategic recommendations', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new PositioningMapperAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.data).toHaveProperty('strategicRecommendations');
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

      const agent = new PositioningMapperAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.metadata.confidence).toBeGreaterThan(0.6);
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

      const agent = new PositioningMapperAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.metadata.sources).toContain('positioning_mapper');
    });
  });
});
