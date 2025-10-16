import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MessagingArchitectureAgent } from '../../src/agents/stage3/messaging-architecture-agent.js';
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
            coreBrandMessage: {
              brandEssence: 'Quality products for everyone',
              brandPromise: 'Affordable quality you can trust',
              brandPurpose: 'Make quality accessible',
              brandPersonality: ['Innovative', 'Trustworthy', 'Accessible']
            },
            valueProposition: {
              brandLevel: {
                headline: 'Quality products at prices that make sense',
                subheadline: 'Premium quality without premium prices',
                keyBenefits: ['Benefit 1', 'Benefit 2', 'Benefit 3']
              },
              segmentLevel: [
                {
                  segmentId: 'segment-1',
                  valueProposition: 'Tailored message'
                }
              ]
            },
            messagingPillars: [
              {
                theme: 'Quality',
                message: 'Premium quality',
                benefits: ['High quality']
              }
            ],
            toneOfVoice: {
              voiceCharacteristics: {
                description: 'Confident and approachable',
                weAre: ['Clear', 'Helpful'],
                weAreNot: ['Pretentious']
              }
            },
            channelMessaging: {
              website: {
                approach: 'Detailed'
              }
            },
            confidence: 0.85
          })
        }],
        usage: {
          input_tokens: 300,
          output_tokens: 600
        }
      })
    }
  }))
}));

describe('MessagingArchitectureAgent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockConfig: AgentConfig = {
    type: AgentType.MESSAGING_ARCHITECTURE,
    maxRetries: 2,
    timeout: 60000,
    model: 'claude-sonnet-4-5-20250929',
    temperature: 0.3
  };

  describe('execute', () => {
    it('should create messaging architecture', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new MessagingArchitectureAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.data).toBeDefined();
    });

    it('should include core brand message', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new MessagingArchitectureAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.data).toHaveProperty('coreBrandMessage');
      const data = result.data as {
        coreBrandMessage: {
          brandEssence: string;
          brandPromise: string;
        };
      };
      expect(data.coreBrandMessage).toHaveProperty('brandEssence');
      expect(data.coreBrandMessage).toHaveProperty('brandPromise');
    });

    it('should include value proposition', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new MessagingArchitectureAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.data).toHaveProperty('valueProposition');
    });

    it('should include messaging pillars', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new MessagingArchitectureAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.data).toHaveProperty('messagingPillars');
    });

    it('should include tone of voice guidelines', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new MessagingArchitectureAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.data).toHaveProperty('toneOfVoice');
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
            segments: [{ id: 'segment-1', name: 'Test Segment' }]
          },
          jtbd: {
            jobsAnalysis: [{ segmentId: 'segment-1', jobs: {} }]
          }
        }
      };

      const agent = new MessagingArchitectureAgent(mockConfig, 'test-api-key');
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

      const agent = new MessagingArchitectureAgent(mockConfig, 'test-api-key');
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

      const agent = new MessagingArchitectureAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.metadata.sources).toContain('messaging_architecture');
    });
  });
});
