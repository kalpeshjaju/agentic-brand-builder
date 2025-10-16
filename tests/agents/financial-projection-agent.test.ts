import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FinancialProjectionAgent } from '../../src/agents/stage2/financial-projection-agent.js';
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
            revenueProjections: {
              assumptions: { marketSize: '₹5000 Cr' },
              projections: [
                { year: 1, revenue: 10000000, customers: 10000 }
              ]
            },
            costStructure: {
              fixedCosts: { total: 4500000 },
              variableCosts: {}
            },
            profitability: {
              byYear: [{ year: 1, revenue: 10000000 }],
              breakEvenMonth: 18
            },
            breakEvenAnalysis: { breakEvenRevenue: 7500000 },
            unitEconomics: { cac: 200, ltv: 800, ltvCacRatio: 4.0 },
            scenarios: {
              best: { year3Revenue: 50000000 },
              base: { year3Revenue: 35000000 },
              worst: { year3Revenue: 20000000 }
            },
            cashFlow: { year1: { netCashFlow: 2500000 } },
            investmentRequirements: { totalNeeded: 5000000 },
            confidence: 0.75
          })
        }],
        usage: { input_tokens: 400, output_tokens: 800 }
      })
    }
  }))
}));

describe('FinancialProjectionAgent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockConfig: AgentConfig = {
    type: AgentType.FINANCIAL_PROJECTION,
    maxRetries: 2,
    timeout: 60000,
    model: 'claude-sonnet-4-5-20250929',
    temperature: 0.3
  };

  describe('execute', () => {
    it('should create financial projections', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          currentRevenue: '₹1 Cr',
          targetRevenue: '₹10 Cr',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new FinancialProjectionAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.data).toBeDefined();
    });

    it('should include revenue projections', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new FinancialProjectionAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.data).toHaveProperty('revenueProjections');
    });

    it('should include cost structure', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new FinancialProjectionAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.data).toHaveProperty('costStructure');
    });

    it('should include profitability analysis', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new FinancialProjectionAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.data).toHaveProperty('profitability');
    });

    it('should include break-even analysis', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new FinancialProjectionAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.data).toHaveProperty('breakEvenAnalysis');
    });

    it('should include unit economics', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new FinancialProjectionAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.data).toHaveProperty('unitEconomics');
    });

    it('should include scenario modeling', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new FinancialProjectionAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.data).toHaveProperty('scenarios');
    });

    it('should include cash flow projections', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new FinancialProjectionAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.data).toHaveProperty('cashFlow');
    });

    it('should include investment requirements', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new FinancialProjectionAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.data).toHaveProperty('investmentRequirements');
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

      const agent = new FinancialProjectionAgent(mockConfig, 'test-api-key');
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

      const agent = new FinancialProjectionAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.metadata.sources).toContain('financial_projection');
    });
  });
});
