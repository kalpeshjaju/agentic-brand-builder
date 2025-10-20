import { describe, it, expect, beforeEach } from 'vitest';
import { ContextManager } from '../../src/config/context-manager.js';
import { Stage, StageStatus, AgentType, AgentStatus } from '../../src/types/index.js';
import type { BrandContext, StageResult } from '../../src/types/index.js';

describe('ContextManager', () => {
  let contextManager: ContextManager;
  const brandContext: BrandContext = {
    brandName: 'Test Brand',
    category: 'Technology',
    competitors: ['Competitor A', 'Competitor B'],
    dataSources: []
  };

  beforeEach(() => {
    contextManager = new ContextManager(brandContext);
  });

  describe('constructor and basic operations', () => {
    it('should initialize with brand context', () => {
      expect(contextManager.getBrandContext()).toEqual(brandContext);
    });

    it('should update brand context', () => {
      contextManager.updateBrandContext({ currentRevenue: '₹50 Cr' });
      const updated = contextManager.getBrandContext();
      expect(updated.currentRevenue).toBe('₹50 Cr');
      expect(updated.brandName).toBe('Test Brand');
    });
  });

  describe('stage output management', () => {
    const mockStageResult: StageResult = {
      stage: Stage.DATA_INGESTION,
      status: StageStatus.COMPLETED,
      agentOutputs: [
        {
          agentType: AgentType.PDF_EXTRACTION,
          status: AgentStatus.COMPLETED,
          data: { extracted: 'test data' },
          metadata: {
            tokensUsed: 1000,
            durationMs: 2000,
            confidence: 0.9
          }
        }
      ],
      startedAt: new Date(),
      completedAt: new Date(),
      durationMs: 2000
    };

    it('should store stage output', () => {
      contextManager.updateStageOutput(Stage.DATA_INGESTION, mockStageResult);
      const retrieved = contextManager.getStageOutput(Stage.DATA_INGESTION);
      
      expect(retrieved).toEqual(mockStageResult);
    });

    it('should mark stage as completed', () => {
      contextManager.updateStageOutput(Stage.DATA_INGESTION, mockStageResult);
      
      expect(contextManager.isStageCompleted(Stage.DATA_INGESTION)).toBe(true);
      expect(contextManager.isStageCompleted(Stage.ANALYSIS)).toBe(false);
    });

    it('should return all stage outputs', () => {
      contextManager.updateStageOutput(Stage.DATA_INGESTION, mockStageResult);
      const allOutputs = contextManager.getAllStageOutputs();
      
      expect(allOutputs).toHaveProperty('data_ingestion');
      expect(allOutputs['data_ingestion']).toHaveProperty('pdf_extraction');
    });
  });

  describe('shared data management', () => {
    it('should store and retrieve shared data', () => {
      contextManager.setSharedData('test_key', { value: 'test_value' });
      const retrieved = contextManager.getSharedData('test_key');
      
      expect(retrieved).toEqual({ value: 'test_value' });
    });

    it('should return undefined for missing key', () => {
      expect(contextManager.getSharedData('nonexistent')).toBeUndefined();
    });
  });

  describe('memory management', () => {
    it('should track memory usage in summary', () => {
      const mockStageResult: StageResult = {
        stage: Stage.DATA_INGESTION,
        status: StageStatus.COMPLETED,
        agentOutputs: [
          {
            agentType: AgentType.PDF_EXTRACTION,
            status: AgentStatus.COMPLETED,
            data: { extracted: 'a'.repeat(1000) }, // 1000 chars
            metadata: {
              tokensUsed: 1000,
              durationMs: 2000
            }
          }
        ],
        startedAt: new Date(),
        completedAt: new Date(),
        durationMs: 2000
      };

      contextManager.updateStageOutput(Stage.DATA_INGESTION, mockStageResult);
      const summary = contextManager.getSummary();
      
      expect(summary.memoryUsageMB).toBeGreaterThanOrEqual(0);
      expect(summary.completedStages).toBe(1);
      expect(summary.totalStages).toBe(6);
    });

    it('should warn about large stage data', () => {
      // Create a very large result
      const largeData = 'x'.repeat(15 * 1024 * 1024); // 15MB of data
      const largeStageResult: StageResult = {
        stage: Stage.DATA_INGESTION,
        status: StageStatus.COMPLETED,
        agentOutputs: [
          {
            agentType: AgentType.PDF_EXTRACTION,
            status: AgentStatus.COMPLETED,
            data: { large: largeData },
            metadata: {
              tokensUsed: 10000,
              durationMs: 5000
            }
          }
        ],
        startedAt: new Date(),
        completedAt: new Date(),
        durationMs: 5000
      };

      // Should not throw, but may log warnings
      expect(() => {
        contextManager.updateStageOutput(Stage.DATA_INGESTION, largeStageResult);
      }).not.toThrow();
    });
  });

  describe('export and import', () => {
    it('should export and import context', () => {
      const mockStageResult: StageResult = {
        stage: Stage.DATA_INGESTION,
        status: StageStatus.COMPLETED,
        agentOutputs: [],
        startedAt: new Date(),
        completedAt: new Date(),
        durationMs: 1000
      };

      contextManager.updateStageOutput(Stage.DATA_INGESTION, mockStageResult);
      contextManager.setSharedData('test', 'value');

      const exported = contextManager.export();

      // Create new context manager and import
      const newContextManager = new ContextManager(brandContext);
      newContextManager.import(exported);

      expect(newContextManager.getBrandContext()).toEqual(brandContext);
      expect(newContextManager.isStageCompleted(Stage.DATA_INGESTION)).toBe(true);
      expect(newContextManager.getSharedData('test')).toBe('value');
    });
  });

  describe('getSummary', () => {
    it('should return correct summary', () => {
      const summary = contextManager.getSummary();

      expect(summary.brandName).toBe('Test Brand');
      expect(summary.category).toBe('Technology');
      expect(summary.completedStages).toBe(0);
      expect(summary.totalStages).toBe(6);
      expect(summary.memoryUsageMB).toBe(0);
    });

    it('should update summary after stages complete', () => {
      const mockResult: StageResult = {
        stage: Stage.DATA_INGESTION,
        status: StageStatus.COMPLETED,
        agentOutputs: [],
        startedAt: new Date(),
        completedAt: new Date(),
        durationMs: 1000
      };

      contextManager.updateStageOutput(Stage.DATA_INGESTION, mockResult);
      contextManager.updateStageOutput(Stage.ANALYSIS, mockResult);

      const summary = contextManager.getSummary();
      expect(summary.completedStages).toBe(2);
    });
  });
});

