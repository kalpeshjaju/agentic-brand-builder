import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MarketDynamicsAgent } from '../../src/agents/stage1/market-dynamics-agent.js';
import type { AgentConfig, AgentInput } from '../../src/types/index.js';
import { AgentType } from '../../src/types/index.js';

// Mock Anthropic SDK
vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: {
      create: vi.fn().mockResolvedValue({
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              industryTrends: {
                macro: [
                  {
                    trend: 'Digital transformation',
                    impact: 'high',
                    direction: 'positive',
                    implication: 'E-commerce becoming critical'
                  }
                ],
                category: [
                  {
                    trend: 'Premiumization',
                    impact: 'high',
                    direction: 'positive',
                    implication: 'Growing demand for premium products'
                  }
                ]
              },
              competitiveDynamics: {
                concentration: 'fragmented',
                intensity: 'high',
                forces: {
                  rivalry: 'high',
                  entryBarriers: 'medium',
                  buyerPower: 'high'
                }
              },
              regulatory: {
                keyRegulations: ['Food safety standards', 'E-commerce regulations'],
                impact: 'medium'
              },
              technology: {
                emerging: ['AI personalization', 'D2C platforms'],
                adoptionStage: 'growth'
              },
              opportunities: [
                {
                  opportunity: 'Tier 2/3 cities underserved',
                  size: '₹2000 Cr',
                  priority: 'high',
                  timeframe: '6-12 months'
                }
              ],
              threats: [
                {
                  threat: 'Price competition from funded startups',
                  severity: 'high',
                  probability: 'medium',
                  mitigation: 'Focus on differentiation'
                }
              ],
              strategicImplications: {
                keyInsights: ['Market fragmenting', 'D2C critical'],
                focusAreas: ['Build online presence', 'Target Tier 2']
              },
              confidence: 0.75
            })
          }
        ],
        usage: {
          input_tokens: 600,
          output_tokens: 1000
        }
      })
    }
  }))
}));

describe('MarketDynamicsAgent', () => {
  let agent: MarketDynamicsAgent;
  let mockConfig: AgentConfig;
  let mockInput: AgentInput;

  beforeEach(() => {
    mockConfig = {
      type: AgentType.MARKET_DYNAMICS,
      maxRetries: 2,
      timeout: 60000,
      model: 'claude-sonnet-4-5-20250929',
      temperature: 0.3
    };

    mockInput = {
      context: {
        brandName: 'Test Brand',
        category: 'Premium Food',
        currentRevenue: '₹5 Cr',
        targetRevenue: '₹20 Cr',
        competitors: []
      },
      previousStageOutputs: {}
    };

    agent = new MarketDynamicsAgent(mockConfig, 'test-api-key');
  });

  it('should create market dynamics analysis', async () => {
    const result = await agent.execute(mockInput);

    expect(result.status).toBe('completed');
    expect(result.data).toBeDefined();
  });

  it('should include industry trends', async () => {
    const result = await agent.execute(mockInput);
    const data = result.data as any;

    expect(data).toHaveProperty('industryTrends');
    expect(data.industryTrends).toHaveProperty('macro');
    expect(data.industryTrends).toHaveProperty('category');
  });

  it('should include competitive dynamics', async () => {
    const result = await agent.execute(mockInput);
    const data = result.data as any;

    expect(data).toHaveProperty('competitiveDynamics');
    expect(data.competitiveDynamics).toHaveProperty('concentration');
    expect(data.competitiveDynamics).toHaveProperty('intensity');
  });

  it('should include regulatory analysis', async () => {
    const result = await agent.execute(mockInput);
    const data = result.data as any;

    expect(data).toHaveProperty('regulatory');
    expect(data.regulatory).toHaveProperty('keyRegulations');
  });

  it('should include technology landscape', async () => {
    const result = await agent.execute(mockInput);
    const data = result.data as any;

    expect(data).toHaveProperty('technology');
    expect(data.technology).toHaveProperty('emerging');
  });

  it('should identify opportunities', async () => {
    const result = await agent.execute(mockInput);
    const data = result.data as any;

    expect(data).toHaveProperty('opportunities');
    expect(Array.isArray(data.opportunities)).toBe(true);
  });

  it('should identify threats', async () => {
    const result = await agent.execute(mockInput);
    const data = result.data as any;

    expect(data).toHaveProperty('threats');
    expect(Array.isArray(data.threats)).toBe(true);
  });

  it('should provide strategic implications', async () => {
    const result = await agent.execute(mockInput);
    const data = result.data as any;

    expect(data).toHaveProperty('strategicImplications');
    expect(data.strategicImplications).toHaveProperty('keyInsights');
    expect(data.strategicImplications).toHaveProperty('focusAreas');
  });

  it('should return confidence score', async () => {
    const result = await agent.execute(mockInput);

    expect(result.metadata.confidence).toBeDefined();
    expect(result.metadata.confidence).toBeGreaterThan(0);
    expect(result.metadata.confidence).toBeLessThanOrEqual(1);
  });

  it('should track token usage', async () => {
    const result = await agent.execute(mockInput);

    expect(result.metadata.tokensUsed).toBeDefined();
    expect(result.metadata.tokensUsed).toBeGreaterThan(0);
  });
});
