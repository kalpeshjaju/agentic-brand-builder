import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StrategicDocumentWriterAgent } from '../../src/agents/stage4/strategic-document-writer-agent.js';
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
            document: {
              title: 'Brand Strategy Document: Test Brand',
              subtitle: 'Strategic Intelligence & Recommendations',
              date: '2025-10-16',
              sections: [
                {
                  id: 'executive-summary',
                  title: 'Executive Summary',
                  content: '# Executive Summary\n\n## The Opportunity\n\nTest content...',
                  pageCount: 2
                },
                {
                  id: 'market-context',
                  title: 'Market Context',
                  content: '# Market Context\n\n## Market Overview\n\nTest content...',
                  pageCount: 3
                },
                {
                  id: 'customer-intelligence',
                  title: 'Customer Intelligence',
                  content: '# Customer Intelligence\n\nTest content...',
                  pageCount: 4
                }
              ],
              metadata: {
                totalPages: 9,
                wordCount: 3000,
                readingTime: '15 minutes'
              }
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

describe('StrategicDocumentWriterAgent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockConfig: AgentConfig = {
    type: AgentType.STRATEGIC_DOCUMENT_WRITER,
    maxRetries: 2,
    timeout: 60000,
    model: 'claude-sonnet-4-5-20250929',
    temperature: 0.3
  };

  describe('execute', () => {
    it('should write strategic document', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new StrategicDocumentWriterAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.data).toBeDefined();
    });

    it('should include document structure', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new StrategicDocumentWriterAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.data).toHaveProperty('document');
      const data = result.data as {
        document: {
          title: string;
          sections: unknown[];
        };
      };
      expect(data.document).toHaveProperty('title');
      expect(data.document).toHaveProperty('sections');
    });

    it('should include multiple sections', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new StrategicDocumentWriterAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      const data = result.data as {
        document: { sections: unknown[] };
      };
      expect(Array.isArray(data.document.sections)).toBe(true);
      expect(data.document.sections.length).toBeGreaterThan(0);
    });

    it('should include document metadata', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new StrategicDocumentWriterAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      const data = result.data as {
        document: { metadata: unknown };
      };
      expect(data.document).toHaveProperty('metadata');
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
          segmentation: { segments: [] },
          jtbd: { jobsAnalysis: [] },
          messaging: { coreBrandMessage: {} }
        }
      };

      const agent = new StrategicDocumentWriterAgent(mockConfig, 'test-api-key');
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

      const agent = new StrategicDocumentWriterAgent(mockConfig, 'test-api-key');
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

      const agent = new StrategicDocumentWriterAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.metadata.sources).toContain('strategic_document_writer');
    });
  });
});
