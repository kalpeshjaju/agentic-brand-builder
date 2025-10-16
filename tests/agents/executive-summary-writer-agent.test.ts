import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExecutiveSummaryWriterAgent } from '../../src/agents/stage4/executive-summary-writer-agent.js';
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
            executiveSummary: {
              opportunity: {
                marketContext: {
                  marketSize: '₹5000 Cr',
                  growth: '15% CAGR'
                },
                customerOpportunity: {
                  unmetNeeds: ['Quality at fair prices']
                },
                competitiveOpportunity: {
                  gaps: ['Mid-premium positioning']
                }
              },
              strategy: {
                vision: 'Make premium accessible',
                positioning: 'Premium quality, honest pricing'
              },
              keyInsights: [
                {
                  priority: 1,
                  headline: 'Mid-premium white space',
                  whatWeLearn: 'Market gap confirmed',
                  whyItMatters: 'Large opportunity',
                  whatToDo: 'Launch mid-premium line'
                }
              ],
              recommendedActions: {
                immediate: [{ action: 'Launch website' }],
                shortTerm: [],
                mediumTerm: []
              },
              expectedOutcomes: {
                financial: {
                  year1: { revenue: '₹10 Cr' }
                },
                strategic: {
                  positioning: 'Market leader'
                }
              },
              investmentRequired: {
                total: '₹15 Cr',
                breakdown: {}
              },
              successMetrics: {
                primary: { revenue: '₹10 Cr' }
              },
              risks: [
                {
                  risk: 'Competition',
                  impact: 'high',
                  mitigation: 'Build loyalty'
                }
              ]
            },
            confidence: 0.85
          })
        }],
        usage: { input_tokens: 500, output_tokens: 1200 }
      })
    }
  }))
}));

describe('ExecutiveSummaryWriterAgent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockConfig: AgentConfig = {
    type: AgentType.EXECUTIVE_SUMMARY_WRITER,
    maxRetries: 2,
    timeout: 60000,
    model: 'claude-sonnet-4-5-20250929',
    temperature: 0.3
  };

  describe('execute', () => {
    it('should create executive summary', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new ExecutiveSummaryWriterAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.data).toBeDefined();
    });

    it('should include opportunity analysis', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new ExecutiveSummaryWriterAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.data).toHaveProperty('executiveSummary');
      const summary = (result.data as { executiveSummary: unknown }).executiveSummary;
      expect(summary).toHaveProperty('opportunity');
    });

    it('should include strategy', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new ExecutiveSummaryWriterAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      const summary = (result.data as { executiveSummary: unknown }).executiveSummary;
      expect(summary).toHaveProperty('strategy');
    });

    it('should include key insights', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new ExecutiveSummaryWriterAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      const summary = (result.data as { executiveSummary: unknown }).executiveSummary;
      expect(summary).toHaveProperty('keyInsights');
    });

    it('should include recommended actions', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new ExecutiveSummaryWriterAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      const summary = (result.data as { executiveSummary: unknown }).executiveSummary;
      expect(summary).toHaveProperty('recommendedActions');
    });

    it('should include expected outcomes', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new ExecutiveSummaryWriterAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      const summary = (result.data as { executiveSummary: unknown }).executiveSummary;
      expect(summary).toHaveProperty('expectedOutcomes');
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

      const agent = new ExecutiveSummaryWriterAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      const summary = (result.data as { executiveSummary: unknown }).executiveSummary;
      expect(summary).toHaveProperty('investmentRequired');
    });

    it('should have high confidence score', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new ExecutiveSummaryWriterAgent(mockConfig, 'test-api-key');
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

      const agent = new ExecutiveSummaryWriterAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.metadata.sources).toContain('executive_summary');
    });
  });
});
