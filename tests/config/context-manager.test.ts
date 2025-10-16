import { describe, it, expect, beforeEach } from 'vitest';
import { ContextManager } from '../../src/config/context-manager.js';
import type { BrandContext, StageResult } from '../../src/types/index.js';
import { Stage, StageStatus, AgentType, AgentStatus } from '../../src/types/index.js';

describe('ContextManager', () => {
  const mockBrandContext: BrandContext = {
    brandName: 'Test Brand',
    category: 'Test Category',
    currentRevenue: '₹10 Cr',
    targetRevenue: '₹50 Cr',
    website: 'https://testbrand.com',
    competitors: ['Competitor A', 'Competitor B'],
    dataSources: [],
    customInstructions: 'Test instructions'
  };

  let contextManager: ContextManager;

  beforeEach(() => {
    contextManager = new ContextManager(mockBrandContext);
  });

  describe('getBrandContext', () => {
    it('should return the brand context', () => {
      const context = contextManager.getBrandContext();
      expect(context).toEqual(mockBrandContext);
    });
  });

  describe('updateBrandContext', () => {
    it('should update brand context with partial updates', () => {
      contextManager.updateBrandContext({
        targetRevenue: '₹100 Cr'
      });

      const updated = contextManager.getBrandContext();
      expect(updated.targetRevenue).toBe('₹100 Cr');
      expect(updated.brandName).toBe('Test Brand'); // Other fields unchanged
    });
  });

  describe('updateStageOutput', () => {
    it('should store stage result', () => {
      const stageResult: StageResult = {
        stage: Stage.DATA_INGESTION,
        status: StageStatus.COMPLETED,
        agentOutputs: [
          {
            agentType: AgentType.COMPETITOR_RESEARCH,
            status: AgentStatus.COMPLETED,
            data: { competitors: ['A', 'B'] },
            metadata: {
              tokensUsed: 1000,
              durationMs: 5000
            }
          }
        ],
        startedAt: new Date(),
        completedAt: new Date(),
        durationMs: 5000
      };

      contextManager.updateStageOutput(Stage.DATA_INGESTION, stageResult);

      const retrieved = contextManager.getStageOutput(Stage.DATA_INGESTION);
      expect(retrieved).toEqual(stageResult);
    });

    it('should extract agent data to shared data', () => {
      const stageResult: StageResult = {
        stage: Stage.ANALYSIS,
        status: StageStatus.COMPLETED,
        agentOutputs: [
          {
            agentType: AgentType.REVIEW_ANALYSIS,
            status: AgentStatus.COMPLETED,
            data: { sentiment: 'positive' },
            metadata: { tokensUsed: 500, durationMs: 3000 }
          }
        ],
        startedAt: new Date(),
        completedAt: new Date(),
        durationMs: 3000
      };

      contextManager.updateStageOutput(Stage.ANALYSIS, stageResult);

      const allOutputs = contextManager.getAllStageOutputs();
      expect(allOutputs[Stage.ANALYSIS]).toBeDefined();
      expect((allOutputs[Stage.ANALYSIS] as any).review_analysis).toEqual({ sentiment: 'positive' });
    });
  });

  describe('isStageCompleted', () => {
    it('should return false for uncompleted stage', () => {
      expect(contextManager.isStageCompleted(Stage.DATA_INGESTION)).toBe(false);
    });

    it('should return true for completed stage', () => {
      const stageResult: StageResult = {
        stage: Stage.DATA_INGESTION,
        status: StageStatus.COMPLETED,
        agentOutputs: [],
        startedAt: new Date(),
        completedAt: new Date(),
        durationMs: 1000
      };

      contextManager.updateStageOutput(Stage.DATA_INGESTION, stageResult);
      expect(contextManager.isStageCompleted(Stage.DATA_INGESTION)).toBe(true);
    });
  });

  describe('getSummary', () => {
    it('should return correct summary', () => {
      const summary = contextManager.getSummary();

      expect(summary.brandName).toBe('Test Brand');
      expect(summary.category).toBe('Test Category');
      expect(summary.completedStages).toBe(0);
      expect(summary.totalStages).toBe(6);
    });

    it('should update completed stages count', () => {
      const stageResult: StageResult = {
        stage: Stage.DATA_INGESTION,
        status: StageStatus.COMPLETED,
        agentOutputs: [],
        startedAt: new Date(),
        completedAt: new Date(),
        durationMs: 1000
      };

      contextManager.updateStageOutput(Stage.DATA_INGESTION, stageResult);

      const summary = contextManager.getSummary();
      expect(summary.completedStages).toBe(1);
    });
  });

  describe('export and import', () => {
    it('should export and import context successfully', () => {
      const stageResult: StageResult = {
        stage: Stage.DATA_INGESTION,
        status: StageStatus.COMPLETED,
        agentOutputs: [],
        startedAt: new Date(),
        completedAt: new Date(),
        durationMs: 1000
      };

      contextManager.updateStageOutput(Stage.DATA_INGESTION, stageResult);
      contextManager.setSharedData('test', { value: 123 });

      const exported = contextManager.export();

      const newContextManager = new ContextManager({ ...mockBrandContext, brandName: 'Different Brand' });
      newContextManager.import(exported);

      expect(newContextManager.getBrandContext().brandName).toBe('Test Brand');
      expect(newContextManager.isStageCompleted(Stage.DATA_INGESTION)).toBe(true);
      expect(newContextManager.getSharedData('test')).toEqual({ value: 123 });
    });
  });
});
