import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EntityRecognitionAgent } from '../../src/agents/stage1/entity-recognition-agent.js';
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
            entities: {
              brands: [
                {
                  id: 'brand-001',
                  name: 'Test Brand',
                  type: 'primary_brand',
                  category: 'Consumer Goods',
                  confidence: 1.0
                }
              ],
              products: [
                {
                  id: 'product-001',
                  name: 'Product A',
                  category: 'Electronics',
                  brandId: 'brand-001',
                  confidence: 0.9
                }
              ],
              people: [
                {
                  id: 'person-001',
                  name: 'John Doe',
                  role: 'CEO',
                  confidence: 0.85
                }
              ],
              locations: [
                {
                  id: 'location-001',
                  name: 'India',
                  type: 'market',
                  confidence: 0.95
                }
              ],
              competitors: [
                {
                  id: 'competitor-001',
                  name: 'Competitor A',
                  type: 'direct',
                  confidence: 1.0
                }
              ],
              events: [],
              financials: []
            },
            relationships: [
              {
                source: 'brand-001',
                target: 'product-001',
                type: 'owns',
                confidence: 0.95
              }
            ],
            summary: {
              totalEntities: 5,
              entitiesByType: {
                brands: 1,
                products: 1,
                people: 1,
                locations: 1,
                competitors: 1
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

describe('EntityRecognitionAgent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockConfig: AgentConfig = {
    type: AgentType.ENTITY_RECOGNITION,
    maxRetries: 2,
    timeout: 60000,
    model: 'claude-sonnet-4-5-20250929',
    temperature: 0.3
  };

  describe('execute', () => {
    it('should extract entities', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: ['Competitor A'],
          dataSources: []
        }
      };

      const agent = new EntityRecognitionAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.data).toBeDefined();
    });

    it('should return entities structure', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new EntityRecognitionAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.data).toHaveProperty('entities');
      const data = result.data as { entities: unknown };
      expect(data.entities).toHaveProperty('brands');
      expect(data.entities).toHaveProperty('products');
      expect(data.entities).toHaveProperty('people');
    });

    it('should extract brand entities', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new EntityRecognitionAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      const data = result.data as { entities: { brands: unknown[] } };
      expect(Array.isArray(data.entities.brands)).toBe(true);
      expect(data.entities.brands.length).toBeGreaterThan(0);
    });

    it('should extract competitor entities', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: ['Competitor A', 'Competitor B'],
          dataSources: []
        }
      };

      const agent = new EntityRecognitionAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      const data = result.data as { entities: { competitors: unknown[] } };
      expect(Array.isArray(data.entities.competitors)).toBe(true);
    });

    it('should include relationships', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new EntityRecognitionAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.data).toHaveProperty('relationships');
    });

    it('should include summary', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new EntityRecognitionAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.data).toHaveProperty('summary');
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

      const agent = new EntityRecognitionAgent(mockConfig, 'test-api-key');
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

      const agent = new EntityRecognitionAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.metadata.sources).toContain('entity_recognition');
    });
  });
});
