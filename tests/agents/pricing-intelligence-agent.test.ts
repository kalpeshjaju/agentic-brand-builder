import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PricingIntelligenceAgent } from '../../src/agents/stage1/pricing-intelligence-agent.js';
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
            competitivePricing: {
              competitors: [
                { name: 'Competitor A', averagePrice: 1500, tier: 'mid-premium' }
              ],
              marketDistribution: { value: '35%', midPremium: '30%' },
              priceGaps: [{ tier: 'affordable-premium', opportunity: 'Large gap' }]
            },
            recommendedPricing: {
              model: 'value-based',
              position: 'affordable-premium',
              recommendedPrice: 1499,
              rationale: 'Sweet spot',
              marginTarget: '40%'
            },
            pricingStrategy: {
              approach: 'Value-based with psychological pricing',
              tactics: ['Charm pricing', 'Anchoring'],
              promotionalStrategy: {
                launchDiscount: '15% off'
              }
            },
            valueJustification: {
              customerValue: '₹3000',
              ourPrice: '₹1499',
              valueProposition: 'Superior value'
            },
            pricingPsychology: {
              primaryTechnique: 'charm_pricing',
              decoyStructure: { basic: 999, standard: 1499, premium: 1999 }
            },
            testingPlan: {
              pricePoints: [1399, 1499, 1599],
              metrics: ['conversion_rate']
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

describe('PricingIntelligenceAgent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockConfig: AgentConfig = {
    type: AgentType.PRICING_INTELLIGENCE,
    maxRetries: 2,
    timeout: 60000,
    model: 'claude-sonnet-4-5-20250929',
    temperature: 0.3
  };

  describe('execute', () => {
    it('should analyze pricing', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new PricingIntelligenceAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.data).toBeDefined();
    });

    it('should include competitive pricing', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new PricingIntelligenceAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.data).toHaveProperty('competitivePricing');
    });

    it('should include recommended pricing', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new PricingIntelligenceAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.data).toHaveProperty('recommendedPricing');
    });

    it('should include pricing strategy', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new PricingIntelligenceAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.data).toHaveProperty('pricingStrategy');
    });

    it('should include value justification', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new PricingIntelligenceAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.data).toHaveProperty('valueJustification');
    });

    it('should include pricing psychology', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new PricingIntelligenceAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.data).toHaveProperty('pricingPsychology');
    });

    it('should include testing plan', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new PricingIntelligenceAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.data).toHaveProperty('testingPlan');
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

      const agent = new PricingIntelligenceAgent(mockConfig, 'test-api-key');
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

      const agent = new PricingIntelligenceAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.metadata.sources).toContain('pricing_intelligence');
    });
  });
});
