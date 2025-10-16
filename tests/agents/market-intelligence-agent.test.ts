import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MarketIntelligenceAgent } from '../../src/agents/stage1/market-intelligence-agent.js';
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
            marketOverview: {
              marketSize: {
                tam: '₹500 Cr',
                sam: '₹200 Cr',
                som: '₹50 Cr'
              },
              growth: {
                historicalCAGR: '15%',
                projectedCAGR: '18%'
              },
              maturityStage: 'growth'
            },
            industryTrends: {
              macroTrends: [
                {
                  trend: 'Digital transformation',
                  impact: 'high'
                }
              ],
              categoryTrends: []
            },
            competitiveDynamics: {
              marketStructure: {
                concentration: 'fragmented',
                majorPlayers: 15
              }
            },
            regulatoryEnvironment: {
              keyRegulations: ['Safety standards'],
              complianceLevel: 'moderate'
            },
            technologyLandscape: {
              current: ['E-commerce'],
              emerging: ['AI personalization']
            },
            opportunities: [
              {
                opportunity: 'Tier 2 cities',
                priority: 'high'
              }
            ],
            threats: [
              {
                threat: 'Aggressive pricing',
                severity: 'high'
              }
            ],
            strategicImplications: {
              keyInsights: ['Market growing'],
              recommendations: ['Focus on Tier 2']
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

describe('MarketIntelligenceAgent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockConfig: AgentConfig = {
    type: AgentType.MARKET_INTELLIGENCE,
    maxRetries: 2,
    timeout: 60000,
    model: 'claude-sonnet-4-5-20250929',
    temperature: 0.3
  };

  describe('execute', () => {
    it('should analyze market intelligence', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new MarketIntelligenceAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.data).toBeDefined();
    });

    it('should include market overview', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new MarketIntelligenceAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.data).toHaveProperty('marketOverview');
    });

    it('should include industry trends', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new MarketIntelligenceAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.data).toHaveProperty('industryTrends');
    });

    it('should include competitive dynamics', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new MarketIntelligenceAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.data).toHaveProperty('competitiveDynamics');
    });

    it('should include opportunities and threats', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new MarketIntelligenceAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.data).toHaveProperty('opportunities');
      expect(result.data).toHaveProperty('threats');
    });

    it('should include strategic implications', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new MarketIntelligenceAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.data).toHaveProperty('strategicImplications');
    });

    it('should have confidence score', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new MarketIntelligenceAgent(mockConfig, 'test-api-key');
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

      const agent = new MarketIntelligenceAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.metadata.sources).toContain('market_intelligence');
    });
  });
});
