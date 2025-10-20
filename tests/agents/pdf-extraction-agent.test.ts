import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PdfExtractionAgent } from '../../src/agents/stage1/pdf-extraction-agent.js';
import type { AgentConfig, AgentInput, BrandContext } from '../../src/types/index.js';
import { AgentType } from '../../src/types/index.js';

// Mock pdf-parse to avoid loading test data files
vi.mock('pdf-parse', () => ({
  default: vi.fn().mockResolvedValue({
    numpages: 1,
    numrender: 1,
    info: {},
    metadata: {},
    text: 'Mocked PDF content for testing',
    version: '1.0.0'
  })
}));

describe('PdfExtractionAgent', () => {
  const mockConfig: AgentConfig = {
    type: AgentType.PDF_EXTRACTION,
    maxRetries: 2,
    timeout: 60000, // 1 minute for PDF processing
    model: 'claude-sonnet-4-5-20250929',
    temperature: 0.3
  };

  const baseBrandContext: BrandContext = {
    brandName: 'Test Brand',
    category: 'Test Category',
    competitors: [],
    dataSources: []
  };

  beforeEach(() => {
    // Reset any mocks
  });

  describe('execute', () => {
    it('should handle brand context with no PDF sources', async () => {
      const input: AgentInput = {
        context: {
          ...baseBrandContext,
          dataSources: [
            {
              type: 'website',
              path: 'https://example.com',
              description: 'Main website'
            }
          ]
        }
      };

      const agent = new PdfExtractionAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.data).toHaveProperty('totalDocuments', 0);
      expect(result.data).toHaveProperty('message');
      expect(result.metadata.confidence).toBe(1.0);
    });

    it('should return proper structure for PDF sources', async () => {
      const input: AgentInput = {
        context: {
          ...baseBrandContext,
          dataSources: [
            {
              type: 'pdf',
              path: './data/test-report.pdf',
              description: 'Test Investor Report'
            }
          ]
        }
      };

      const agent = new PdfExtractionAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.data).toHaveProperty('totalDocuments');
      expect(result.data).toHaveProperty('documents');
      expect(result.data).toHaveProperty('extractionSummary');
    });

    it('should handle multiple PDF sources', async () => {
      const input: AgentInput = {
        context: {
          ...baseBrandContext,
          dataSources: [
            {
              type: 'pdf',
              path: './data/report1.pdf',
              description: 'First Report'
            },
            {
              type: 'pdf',
              path: './data/report2.pdf',
              description: 'Second Report'
            }
          ]
        }
      };

      const agent = new PdfExtractionAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      const data = result.data as any;
      expect(data.totalDocuments).toBe(2);
      expect(data.documents).toHaveLength(2);
    });

    it('should mark non-existent files appropriately', async () => {
      const input: AgentInput = {
        context: {
          ...baseBrandContext,
          dataSources: [
            {
              type: 'pdf',
              path: './data/non-existent-file.pdf',
              description: 'Missing File'
            }
          ]
        }
      };

      const agent = new PdfExtractionAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      const data = result.data as any;
      expect(data.documents[0]).toHaveProperty('extracted', false);
      expect(data.documents[0]).toHaveProperty('error');
    });

    it('should calculate confidence based on success rate', async () => {
      const input: AgentInput = {
        context: {
          ...baseBrandContext,
          dataSources: [
            {
              type: 'pdf',
              path: './data/file1.pdf',
              description: 'File 1'
            },
            {
              type: 'pdf',
              path: './data/file2.pdf',
              description: 'File 2'
            }
          ]
        }
      };

      const agent = new PdfExtractionAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.metadata.confidence).toBeGreaterThanOrEqual(0);
      expect(result.metadata.confidence).toBeLessThanOrEqual(1);
    });

    it('should include extraction metadata', async () => {
      const input: AgentInput = {
        context: {
          ...baseBrandContext,
          dataSources: [
            {
              type: 'pdf',
              path: './data/test.pdf',
              description: 'Test PDF'
            }
          ]
        }
      };

      const agent = new PdfExtractionAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.metadata).toHaveProperty('durationMs');
      // Duration might be 0 for non-existent files processed quickly
      expect(result.metadata.durationMs).toBeGreaterThanOrEqual(0);
    });

    it('should provide sources list', async () => {
      const input: AgentInput = {
        context: {
          ...baseBrandContext,
          dataSources: [
            {
              type: 'pdf',
              path: './data/report.pdf',
              description: 'Test Report'
            }
          ]
        }
      };

      const agent = new PdfExtractionAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      expect(result.status).toBe('completed');
      expect(result.metadata.sources).toBeDefined();
    });
  });

  describe('data structure validation', () => {
    it('should return structured extraction summary', async () => {
      const input: AgentInput = {
        context: {
          ...baseBrandContext,
          dataSources: [
            {
              type: 'pdf',
              path: './data/test.pdf',
              description: 'Test'
            }
          ]
        }
      };

      const agent = new PdfExtractionAgent(mockConfig, 'test-api-key');
      const result = await agent.execute(input);

      const data = result.data as any;
      expect(data.extractionSummary).toHaveProperty('filesProcessed');
      expect(data.extractionSummary).toHaveProperty('filesSuccessful');
      expect(data.extractionSummary).toHaveProperty('filesFailed');
    });
  });
});
