import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrandNarrativeAgent } from '../../src/agents/stage3/brand-narrative-agent.js';
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
            originStory: {
              theProblem: 'Customers struggled with high prices',
              theInsight: 'Quality doesn\'t have to cost a fortune',
              theJourney: 'Started with a simple mission',
              theMission: 'Make quality accessible',
              fullStory: 'Full origin narrative...'
            },
            missionVisionValues: {
              mission: 'Deliver quality at fair prices',
              vision: 'Quality for all',
              values: [
                {
                  value: 'Quality First',
                  definition: 'Never compromise',
                  behaviors: ['Best materials']
                }
              ]
            },
            brandPersonality: {
              primaryDimension: 'Competence',
              archetype: 'The Regular Guy',
              characterTraits: {
                personality: ['Reliable', 'Honest'],
                speakingStyle: 'Clear and friendly'
              }
            },
            customerStories: [
              {
                title: 'Customer Success',
                type: 'transformation',
                fullStory: 'Success narrative...'
              }
            ],
            founderStory: {
              name: 'Founder',
              fullStory: 'Founder journey...'
            },
            futureVision: {
              building: 'Trusted brand',
              narrative: 'Vision story...'
            },
            narrativeThemes: [
              {
                theme: 'Empowerment',
                description: 'Quality for everyone'
              }
            ],
            confidence: 0.80
          })
        }],
        usage: {
          input_tokens: 500,
          output_tokens: 1000
        }
      })
    }
  }))
}));

describe('BrandNarrativeAgent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockConfig: AgentConfig = {
    type: AgentType.BRAND_NARRATIVE,
    maxRetries: 2,
    timeout: 60000,
    model: 'claude-sonnet-4-5-20250929',
    temperature: 0.3
  };

  describe('execute', () => {
    it('should create brand narrative', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new BrandNarrativeAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.data).toBeDefined();
    });

    it('should include origin story', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new BrandNarrativeAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.data).toHaveProperty('originStory');
    });

    it('should include mission, vision and values', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new BrandNarrativeAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.data).toHaveProperty('missionVisionValues');
    });

    it('should include brand personality', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new BrandNarrativeAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.data).toHaveProperty('brandPersonality');
    });

    it('should include customer stories', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new BrandNarrativeAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.data).toHaveProperty('customerStories');
    });

    it('should include future vision', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new BrandNarrativeAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.data).toHaveProperty('futureVision');
    });

    it('should include narrative themes', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new BrandNarrativeAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.data).toHaveProperty('narrativeThemes');
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

      const agent = new BrandNarrativeAgent(mockConfig, 'test-api-key');
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

      const agent = new BrandNarrativeAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.metadata.sources).toContain('brand_narrative');
    });
  });
});
