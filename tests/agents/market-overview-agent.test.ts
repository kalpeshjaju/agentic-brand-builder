import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MarketOverviewAgent } from '../../src/agents/stage1/market-overview-agent.js';
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
              marketSize: {
                tam: '₹85000 Cr',
                sam: '₹12500 Cr',
                som: '₹625 Cr',
                period: '2024',
                geography: 'India'
              },
              growth: {
                historicalCAGR: '18.5%',
                projectedCAGR: '22.3%',
                period: '2024-2029',
                drivers: ['Rising disposable income', 'Premiumization trend']
              },
              maturityStage: 'growth',
              segmentation: [
                {
                  segment: 'Premium',
                  size: '₹5000 Cr',
                  growth: '25%',
                  profitability: 'high',
                  competition: 'medium'
                }
              ],
              opportunitySize: {
                totalMarket: '₹12500 Cr',
                targetSegment: '₹5000 Cr',
                realisticCapture: '₹250 Cr (5%)'
              },
              confidence: 0.78
            })
          }
        ],
        usage: {
          input_tokens: 500,
          output_tokens: 800
        }
      })
    }
  }))
}));

describe('MarketOverviewAgent', () => {
  let agent: MarketOverviewAgent;
  let mockConfig: AgentConfig;
  let mockInput: AgentInput;

  beforeEach(() => {
    mockConfig = {
      type: AgentType.MARKET_OVERVIEW,
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

    agent = new MarketOverviewAgent(mockConfig, 'test-api-key');
  });

  it('should create market overview analysis', async () => {
    const result = await agent.execute(mockInput);

    expect(result.status).toBe('completed');
    expect(result.data).toBeDefined();
  });

  it('should include market sizing (TAM/SAM/SOM)', async () => {
    const result = await agent.execute(mockInput);
    const data = result.data as any;

    expect(data).toHaveProperty('marketSize');
    expect(data.marketSize).toHaveProperty('tam');
    expect(data.marketSize).toHaveProperty('sam');
    expect(data.marketSize).toHaveProperty('som');
  });

  it('should include growth analysis', async () => {
    const result = await agent.execute(mockInput);
    const data = result.data as any;

    expect(data).toHaveProperty('growth');
    expect(data.growth).toHaveProperty('historicalCAGR');
    expect(data.growth).toHaveProperty('projectedCAGR');
  });

  it('should include market maturity stage', async () => {
    const result = await agent.execute(mockInput);
    const data = result.data as any;

    expect(data).toHaveProperty('maturityStage');
    expect(['emerging', 'growth', 'mature', 'declining']).toContain(data.maturityStage);
  });

  it('should include market segmentation', async () => {
    const result = await agent.execute(mockInput);
    const data = result.data as any;

    expect(data).toHaveProperty('segmentation');
    expect(Array.isArray(data.segmentation)).toBe(true);
  });

  it('should include opportunity sizing', async () => {
    const result = await agent.execute(mockInput);
    const data = result.data as any;

    expect(data).toHaveProperty('opportunitySize');
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
