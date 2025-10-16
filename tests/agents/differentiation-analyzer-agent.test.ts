import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DifferentiationAnalyzerAgent } from '../../src/agents/stage2/differentiation-analyzer-agent.js';
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
            pointsOfParity: [
              {
                feature: 'Product quality',
                brandStatus: 'meets_standard',
                priority: 'maintain'
              }
            ],
            pointsOfDifference: [
              {
                differentiator: 'Sustainable materials',
                type: 'product',
                desirability: 8,
                deliverability: 9,
                differentiation: 7,
                defensibility: 8,
                overallScore: 8.0
              }
            ],
            competitiveAdvantages: [
              {
                advantage: 'Direct-to-consumer model',
                type: 'cost_advantage',
                sustainability: 'high'
              }
            ],
            ownableTerritories: [
              {
                territory: 'Affordable sustainability',
                ownership: 0.3,
                potential: 0.8
              }
            ],
            differentiationStrategy: {
              recommendedApproach: 'Be Different',
              primaryDifferentiators: ['Sustainable materials'],
              rationale: 'Clear white space'
            },
            proofPointsMatrix: {
              claim: 'Most sustainable',
              reasonsToBelieve: ['Certified materials'],
              proofPoints: ['Certifications']
            },
            confidence: 0.85
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

describe('DifferentiationAnalyzerAgent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockConfig: AgentConfig = {
    type: AgentType.DIFFERENTIATION_ANALYZER,
    maxRetries: 2,
    timeout: 60000,
    model: 'claude-sonnet-4-5-20250929',
    temperature: 0.3
  };

  describe('execute', () => {
    it('should analyze differentiation', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new DifferentiationAnalyzerAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.data).toBeDefined();
    });

    it('should include points of parity', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new DifferentiationAnalyzerAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.data).toHaveProperty('pointsOfParity');
    });

    it('should include points of difference', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new DifferentiationAnalyzerAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.data).toHaveProperty('pointsOfDifference');
    });

    it('should include competitive advantages', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new DifferentiationAnalyzerAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.data).toHaveProperty('competitiveAdvantages');
    });

    it('should identify ownable territories', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new DifferentiationAnalyzerAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.data).toHaveProperty('ownableTerritories');
    });

    it('should include differentiation strategy', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new DifferentiationAnalyzerAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.data).toHaveProperty('differentiationStrategy');
    });

    it('should include proof points matrix', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new DifferentiationAnalyzerAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.data).toHaveProperty('proofPointsMatrix');
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

      const agent = new DifferentiationAnalyzerAgent(mockConfig, 'test-api-key');
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

      const agent = new DifferentiationAnalyzerAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.metadata.sources).toContain('differentiation_analyzer');
    });
  });
});
