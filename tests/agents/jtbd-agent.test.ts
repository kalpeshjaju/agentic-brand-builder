import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JtbdAgent } from '../../src/agents/stage2/jtbd-agent.js';
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
            jobsAnalysis: [
              {
                segmentId: 'segment-1',
                segmentName: 'Budget-Conscious Millennials',
                jobs: {
                  functional: [
                    {
                      job: 'Find affordable quality products',
                      importance: 9,
                      currentSatisfaction: 5,
                      opportunityScore: 13
                    }
                  ],
                  emotional: [
                    {
                      job: 'Feel smart about purchases',
                      importance: 8,
                      currentSatisfaction: 6,
                      opportunityScore: 10
                    }
                  ],
                  social: [
                    {
                      job: 'Be seen as savvy shopper',
                      importance: 6,
                      currentSatisfaction: 7,
                      opportunityScore: 6
                    }
                  ]
                },
                pains: [
                  {
                    pain: 'High prices',
                    severity: 'severe',
                    type: 'functional'
                  }
                ],
                gains: [
                  {
                    gain: 'Save money',
                    category: 'required',
                    value: 'essential'
                  }
                ]
              }
            ],
            keyInsights: {
              topUnderservedJobs: [
                {
                  job: 'Find affordable quality products',
                  opportunityScore: 13
                }
              ],
              criticalPains: ['High prices'],
              mustHaveGains: ['Save money']
            },
            confidence: 0.85
          })
        }],
        usage: {
          input_tokens: 250,
          output_tokens: 500
        }
      })
    }
  }))
}));

describe('JtbdAgent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockConfig: AgentConfig = {
    type: AgentType.JOBS_TO_BE_DONE,
    maxRetries: 2,
    timeout: 60000,
    model: 'claude-sonnet-4-5-20250929',
    temperature: 0.3
  };

  describe('execute', () => {
    it('should perform JTBD analysis', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new JtbdAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.data).toBeDefined();
    });

    it('should return jobsAnalysis array', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new JtbdAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.data).toHaveProperty('jobsAnalysis');
      const data = result.data as { jobsAnalysis: unknown[] };
      expect(Array.isArray(data.jobsAnalysis)).toBe(true);
    });

    it('should include functional, emotional, and social jobs', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new JtbdAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      const data = result.data as {
        jobsAnalysis: Array<{
          jobs: {
            functional: unknown[];
            emotional: unknown[];
            social: unknown[];
          };
        }>;
      };
      expect(data.jobsAnalysis[0].jobs).toHaveProperty('functional');
      expect(data.jobsAnalysis[0].jobs).toHaveProperty('emotional');
      expect(data.jobsAnalysis[0].jobs).toHaveProperty('social');
    });

    it('should include pains and gains', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new JtbdAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      const data = result.data as {
        jobsAnalysis: Array<{
          pains: unknown[];
          gains: unknown[];
        }>;
      };
      expect(data.jobsAnalysis[0]).toHaveProperty('pains');
      expect(data.jobsAnalysis[0]).toHaveProperty('gains');
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

      const agent = new JtbdAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.data).toHaveProperty('keyInsights');
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
          segmentation: {
            segments: [
              {
                id: 'segment-1',
                name: 'Budget Segment'
              }
            ]
          }
        }
      };

      const agent = new JtbdAgent(mockConfig, 'test-api-key');
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

      const agent = new JtbdAgent(mockConfig, 'test-api-key');
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

      const agent = new JtbdAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.metadata.sources).toContain('jtbd_analysis');
    });
  });
});
