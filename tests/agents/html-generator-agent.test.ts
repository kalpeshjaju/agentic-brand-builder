import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HtmlGeneratorAgent } from '../../src/agents/stage6/html-generator-agent.js';
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
            html: {
              filename: 'brand-strategy-test-brand.html',
              content: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>Test Brand Strategy</title>\n</head>\n<body>\n  <h1>Test Brand Strategy</h1>\n  <section id="executive-summary">\n    <h2>Executive Summary</h2>\n  </section>\n</body>\n</html>',
              cssVariables: {
                primaryColor: '#2c3e50',
                secondaryColor: '#3498db',
                backgroundColor: '#ffffff',
                textColor: '#333333'
              },
              metadata: {
                title: 'Brand Strategy: Test Brand',
                description: 'Comprehensive brand strategy',
                fileSize: '25KB',
                sections: 6
              }
            },
            assets: {
              customCSS: '/* Custom styles */',
              javascript: '/* Optional JS */'
            },
            confidence: 0.90
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

describe('HtmlGeneratorAgent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockConfig: AgentConfig = {
    type: AgentType.HTML_GENERATOR,
    maxRetries: 2,
    timeout: 60000,
    model: 'claude-sonnet-4-5-20250929',
    temperature: 0.3
  };

  describe('execute', () => {
    it('should generate HTML', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new HtmlGeneratorAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.data).toBeDefined();
    });

    it('should include HTML structure', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new HtmlGeneratorAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.data).toHaveProperty('html');
      const data = result.data as {
        html: { content: string; filename: string };
      };
      expect(data.html).toHaveProperty('content');
      expect(data.html).toHaveProperty('filename');
    });

    it('should include valid HTML content', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new HtmlGeneratorAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      const data = result.data as { html: { content: string } };
      expect(data.html.content).toContain('<!DOCTYPE html>');
      expect(data.html.content).toContain('<html');
      expect(data.html.content).toContain('</html>');
    });

    it('should include CSS variables', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new HtmlGeneratorAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      const data = result.data as { html: { cssVariables: unknown } };
      expect(data.html).toHaveProperty('cssVariables');
    });

    it('should include metadata', async () => {
      const input: AgentInput = {
        context: {
          brandName: 'Test Brand',
          category: 'Consumer Goods',
          competitors: [],
          dataSources: []
        }
      };

      const agent = new HtmlGeneratorAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      const data = result.data as { html: { metadata: unknown } };
      expect(data.html).toHaveProperty('metadata');
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
          document_writer: {
            document: {
              sections: []
            }
          }
        }
      };

      const agent = new HtmlGeneratorAgent(mockConfig, 'test-api-key');
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

      const agent = new HtmlGeneratorAgent(mockConfig, 'test-api-key');
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

      const agent = new HtmlGeneratorAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.metadata.sources).toContain('html_generator');
    });
  });
});
